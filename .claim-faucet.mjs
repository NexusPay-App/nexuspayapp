// Claim test BOT from the official faucet.
// Fixes Cloudflare Turnstile failure caused by IPv6-only brunhild.challenges.cloudflare.com
// on a host with no IPv6 egress — maps that hostname to Cloudflare IPv4 via Chrome resolver rules.
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const ADDRESS = process.env.ADDRESS || '0xaFF80c4D9Af0D36178338142F8D7275aF799B3E3';
const ASSET = process.env.ASSET || 'BOT';
const OUT = process.env.HOME + '/bot-e2e/faucet-claim.json';
const log = m => console.log(`[${new Date().toISOString()}] ${m}`);
const sleep = ms => new Promise(r => setTimeout(r, ms));

const browser = await chromium.launch({
  channel: 'chrome',
  headless: false,
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-blink-features=AutomationControlled',
    // Critical: brunhild.challenges.cloudflare.com is AAAA-only; map to Cloudflare edge IPv4
    '--host-resolver-rules=MAP brunhild.challenges.cloudflare.com 104.18.94.41',
  ],
});

const ctx = await browser.newContext({
  viewport: { width: 1366, height: 900 },
  locale: 'en-US',
});
await ctx.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  window.chrome = window.chrome || { runtime: {} };
});

const page = await ctx.newPage();
page.on('response', async res => {
  const u = res.url();
  if (u.includes('/api/v1/faucet') && !u.endsWith('/info')) {
    let body = '';
    try { body = (await res.text()).slice(0, 800); } catch {}
    log(`API ${res.status()} → ${body}`);
    writeFileSync(OUT, JSON.stringify({ httpStatus: res.status(), body, at: new Date().toISOString() }, null, 2));
  }
});
page.on('requestfailed', req => {
  if (/challenges\.cloudflare|turnstile/i.test(req.url())) {
    log(`REQFAIL ${req.failure()?.errorText} ${req.url().slice(0, 120)}`);
  }
});

try {
  await page.goto('https://faucet.botchain.ai/en/basic', { waitUntil: 'commit', timeout: 90000 });
} catch (e) {
  log(`goto note: ${e.message.slice(0, 120)}`);
}
await sleep(6000);

const addrInput = page.locator('input[name="address"], input[placeholder="0x..."]').first();
await addrInput.waitFor({ state: 'visible', timeout: 30000 });
await addrInput.fill(ADDRESS);
log(`address filled: ${ADDRESS}`);

const assetBtn = page.locator('button', { hasText: new RegExp(`Test ${ASSET}`, 'i') }).first();
if (await assetBtn.count()) {
  await assetBtn.click();
  log(`selected ${ASSET}`);
}
await sleep(800);

for (let attempt = 1; attempt <= 4; attempt++) {
  const ts = page.locator('button', { hasText: /not a robot|Verification|Retry/i }).first();
  const st = (await ts.innerText().catch(() => '')).replace(/\n/g, ' ');
  log(`attempt ${attempt}: ${st.slice(0, 90)}`);
  if (!(await ts.isEnabled().catch(() => false))) {
    log('verification button disabled — waiting…');
    await sleep(3000);
    continue;
  }
  await ts.click();
  log('clicked verification');

  let claimed = false;
  for (let i = 0; i < 45; i++) {
    await sleep(1000);
    const t = (await ts.innerText().catch(() => '')).replace(/\n/g, ' ');
    if (i % 5 === 0) log(`  ${t.slice(0, 90)}`);
    const send = page.locator('button', { hasText: /Send\s+\d+/i }).first();
    if (await send.isEnabled().catch(() => false)) {
      log('send enabled — claiming…');
      await send.click();
      await sleep(15000);
      const pageText = (await page.locator('body').innerText().catch(() => '')).slice(0, 2000);
      log(`=== AFTER CLAIM ===\n${pageText}`);
      writeFileSync(OUT, JSON.stringify({ ok: true, address: ADDRESS, asset: ASSET, pageText, at: new Date().toISOString() }, null, 2));
      claimed = true;
      break;
    }
    if (/failed/i.test(t) && i > 10) break;
  }
  if (claimed) {
    await browser.close();
    log('CLAIM SUBMITTED');
    process.exit(0);
  }
  log(`attempt ${attempt} did not claim`);
  const retry = page.locator('button', { hasText: /retry/i }).first();
  if (await retry.count().catch(() => 0)) {
    await retry.click().catch(() => {});
    await sleep(2000);
  }
}

const pageText = (await page.locator('body').innerText().catch(() => '')).slice(0, 1500);
log(`=== FAILED ===\n${pageText}`);
writeFileSync(OUT, JSON.stringify({ ok: false, address: ADDRESS, asset: ASSET, pageText, at: new Date().toISOString() }, null, 2));
await browser.close();
process.exit(1);
