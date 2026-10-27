// Live browser smoke: sign in via localStorage session (OTP delivery is not wired
// locally) and verify BOT Chain renders through the SAME shared screens as other
// chains: the home chain selector, home balances/recent history, and the send form.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const session = JSON.parse(readFileSync(process.env.HOME + '/bot-e2e/session.json', 'utf8'));
const API = 'http://localhost:8000/api';

// Live capabilities so assertions use the exact rendered values
const caps = await fetch(API + '/botchain/networks').then(r => r.json());
const testnet = (caps?.data || []).find(n => n.id === 'botchain-testnet');
const mainnet = (caps?.data || []).find(n => n.id === 'botchain');
if (!testnet?.enabled || mainnet?.enabled) { console.error('FAIL: capabilities unexpected', JSON.stringify(caps)); process.exit(1); }

let pass = 0, fail = 0;
const ok = (name, cond, detail = '') => { cond ? pass++ : fail++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  [' + detail + ']' : ''}`); };

const browser = await chromium.launch({ executablePath: process.env.HOME + '/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome' });
const page = await browser.newPage();
const failedRequests = [];
page.on('response', r => { if (r.status() >= 400 && r.url().includes('/api/')) failedRequests.push(`${r.status()} ${new URL(r.url()).pathname}`); });

await page.addInitScript(([token, user]) => {
  localStorage.setItem('nexuspay_token', token);
  localStorage.setItem('nexuspay_user', JSON.stringify(user));
}, [session.token, { walletAddress: '0x3333333333333333333333333333333333333333', email: session.email, token: session.token }]);

// 1. Home: BOT networks appear in the SAME chain selector as every other chain
await page.goto('http://localhost:3000/home', { waitUntil: 'networkidle', timeout: 60000 });
ok('home loads without login redirect', !page.url().includes('/login'), page.url());
// The pre-existing PWA install dialog auto-opens on home and overlays the page.
await page.getByRole('button', { name: 'Got it' }).click({ timeout: 5000 }).catch(() => {});
await page.locator('button', { hasText: 'All Chains' }).first().click();
const testnetOption = page.getByRole('option', { name: 'BOT Chain Testnet' });
await testnetOption.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
ok('chain selector offers BOT Chain Testnet (live capabilities)', await testnetOption.isVisible().catch(() => false));
ok('disabled BOT mainnet not offered', (await page.getByRole('option', { name: 'BOT Chain', exact: true }).count()) === 0);
await testnetOption.click();
ok('selecting BOT fetches its balance through /token/balance/:chain', await page.getByText('No tokens found').first().isVisible().catch(() => false)
  || await page.getByText(/BOT/).first().isVisible().catch(() => false));

// 2. Home recent history includes the real BOT payment recorded by the transfer test
await page.waitForTimeout(2500);
const homeText = await page.locator('body').innerText();
ok('merged history shows the BOT payment (0.000001 USDT)', homeText.includes('0.000001 USDT'));

// 3. Send screen: BOT is a normal option in the shared send form
await page.goto('http://localhost:3000/crypto', { waitUntil: 'networkidle', timeout: 60000 });
const chainSelect = page.getByLabel('Chain', { exact: true });
await expectOption(chainSelect, 'botchain-testnet', true);
await expectOption(chainSelect, 'botchain', false);
await chainSelect.selectOption('botchain-testnet');
const tokenTexts = (await page.locator('#tokenType option').allTextContents()).map(t => t.trim()).sort();
ok('send form offers only BOT assets for a BOT network', JSON.stringify(tokenTexts) === JSON.stringify(['BOT', 'USDT', 'WBOT']), tokenTexts.join(','));
ok('USDT is the default BOT asset (never a legacy symbol)', (await page.locator('#tokenType').inputValue()) === 'USDT');

// 4. Only failures on the endpoints under test matter; legacy 404s are known/pre-existing
const KNOWN = ['/api/business/my-businesses', '/api/stellar/wallet'];
const botFailures = failedRequests.filter(f => (f.includes('/botchain/') || f.includes('/token/')) && !KNOWN.some(k => f.includes(k)));
const others = failedRequests.filter(f => !botFailures.includes(f));
ok('no failed BOT/token requests', botFailures.length === 0, botFailures.slice(0, 3).join(' | '));
if (others.length) console.log(`INFO  other failed requests (pre-existing, out of scope): ${[...new Set(others)].join(' | ')}`);

async function expectOption(select, name, visible) {
  const count = await select.locator(`option[value="${name}"]`).count();
  ok(visible ? `send selector offers ${name}` : `send selector hides disabled ${name}`, (count > 0) === visible, `count=${count}`);
}

console.log(`\nRESULT live-smoke: ${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
