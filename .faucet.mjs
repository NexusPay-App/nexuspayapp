// Claim test BOT from the official testnet faucet for our test smart-account address.
// Reconnaissance first: dump the page structure, then fill whatever address field exists.
import { chromium } from 'playwright';

const ADDRESS = '0xaFF80c4D9Af0D36178338142F8D7275aF799B3E3';
const browser = await chromium.launch({ executablePath: process.env.HOME + '/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome' });
const page = await browser.newPage();
page.on('dialog', d => d.dismiss().catch(() => {}));

await page.goto('https://faucet.bohr.life/basic', { waitUntil: 'networkidle', timeout: 60000 }).catch(e => console.log('goto issue:', e.message));
await page.waitForTimeout(4000);
console.log('=== PAGE TEXT (2200 chars) ===');
console.log((await page.locator('body').innerText().catch(() => '')).slice(0, 2200));
const inputs = await page.locator('input').all();
console.log('=== INPUTS:', inputs.length);
for (let i = 0; i < inputs.length; i++) {
  const el = inputs[i];
  console.log(`input#${i} type=${await el.getAttribute('type')} placeholder=${await el.getAttribute('placeholder')} name=${await el.getAttribute('name')} visible=${await el.isVisible()}`);
}
const buttons = await page.locator('button').all();
console.log('=== BUTTONS:', buttons.length);
for (let i = 0; i < Math.min(buttons.length, 12); i++) {
  const b = buttons[i];
  console.log(`button#${i} "${(await b.innerText().catch(() => '')).replace(/\n/g, ' ').slice(0, 60)}" visible=${await b.isVisible()}`);
}
await browser.close();
