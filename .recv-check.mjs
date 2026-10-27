// Verify the shared receive screen renders the live BOT testnet address.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const session = JSON.parse(readFileSync(process.env.HOME + '/bot-e2e/session.json', 'utf8'));
const browser = await chromium.launch({ executablePath: process.env.HOME + '/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome' });
const page = await browser.newPage();
await page.addInitScript(([token, user]) => {
  localStorage.setItem('nexuspay_token', token);
  localStorage.setItem('nexuspay_user', JSON.stringify(user));
}, [session.token, { walletAddress: '0x3333333333333333333333333333333333333333', email: session.email, token: session.token }]);
await page.goto('http://localhost:3000/receive', { waitUntil: 'networkidle', timeout: 60000 });
await page.getByRole('button', { name: 'Got it' }).click({ timeout: 4000 }).catch(() => {});
await page.waitForTimeout(6000);
const text = await page.locator('body').innerText();
const addressShown = text.includes('0xaFF80c4D') || text.includes('...F799B3E3') || text.includes('0xaFF80c4D9Af0D36178338142F8D7275aF799B3E3');
console.log('BOT testnet section present:', text.includes('BOT Chain Testnet Address'));
console.log('address rendered:', addressShown);
console.log('not-available gone:', !text.includes('Not available'));
console.log('transfers-enabled note:', text.includes('Transfers are enabled.'));
console.log(text.slice(text.indexOf('BOT Chain Testnet Address') - 40, text.indexOf('BOT Chain Testnet Address') + 260));
await browser.close();
process.exit(addressShown && text.includes('BOT Chain Testnet Address') ? 0 : 1);
