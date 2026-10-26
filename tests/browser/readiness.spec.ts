import { test, expect, type Page } from '@playwright/test';
const address = '0x1111111111111111111111111111111111111111';
const capabilities = [{ id: 'botchain-testnet', name: 'BOT Chain Testnet', chainId: 968, enabled: true, transfers: true, merchantPayments: true, testnet: true, tokens: [{ symbol: 'USDT', decimals: 6 }, { symbol: 'BOT', decimals: 18 }] }, { id: 'botchain', name: 'BOT Chain', chainId: 677, enabled: false, transfers: false }];
async function setup(page: Page, rejectPassword = false, network = 'botchain') {
  let posts = 0;
  let legacy = 0;
  await page.addInitScript(() => {
    localStorage.setItem("pwa-install-dismissed", String(Date.now()));
    const token = `e30.${btoa(JSON.stringify({ exp: 4102444800 }))}.fixture`;
    localStorage.setItem('nexuspay_token', token);
    localStorage.setItem('nexuspay_user', JSON.stringify({ walletAddress: '0x1111111111111111111111111111111111111111', email: 'fixture@example.test', token }));
  });
  const payment = { id: 'test-payment', network, sender: address, recipient: address, amount: '0.01', tokenSymbol: 'USDT', status: 'pending', createdAt: new Date().toISOString() };
  const explorer = network === 'botchain' ? 'https://scan.botchain.ai' : 'https://scan.bohr.life';
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    let data: unknown = {};
    if (path.endsWith(`/botchain/${network}/quote`)) return route.fulfill({json: {success: true, data: {maxNetworkFee: '0.00001', walletFee: '0.00001', totalBotDebit: '0.02001', feeCurrency: 'BOT', expiresAt: new Date(Date.now() + 60000).toISOString()}}});
    if (path.endsWith('/botchain/networks')) data = capabilities.map(n => n.id === 'botchain' && network === 'botchain' ? { ...n, enabled: true, transfers: true, merchantPayments: true, testnet: false, tokens: capabilities[0].tokens } : n);
    else if (path.endsWith('/token/networks')) data = [{ id: 'arbitrum', name: 'Arbitrum', chainId: 42161, tokens: [{ symbol: 'USDC', decimals: 6 }] }];
    else if (path.endsWith(`/botchain/${network}/balances`)) data = {address, balances: [{symbol: 'USDT', balance: '20'}, {symbol: 'BOT', balance: '1'}]};
    else if (path.endsWith('/token/receive')) data = { walletAddress: address };
    else if (path.endsWith('/token/sendToken')) legacy++;
    else if (path.includes('/token/balance')) data = { walletAddress: address, balances: {}, totalUSDValue: 0, supportedChains: ['arbitrum'], lastUpdated: new Date().toISOString() };
    else if (path.endsWith('/transactions/history')) data = { transactions: [], pagination: { total: 0 } };
    else if (path.endsWith(`/botchain/${network}/transfers`) && route.request().method() === 'POST') {
      posts++;
      expect(route.request().postDataJSON().recipientIdentifier).toBe('+254712345678');
      expect(route.request().postDataJSON().senderAddress).toBeUndefined();
      if (rejectPassword) return route.fulfill({ status: 401, json: { success: false, error: { code: 'PAYMENT_AUTH_REQUIRED', message: 'Enter your NexusPay account password.' } } });
      data = payment;
    } else if (path.endsWith('/transfers/test-payment')) data = { ...payment, status: 'confirmed', transactionHash: '0xabc', explorerUrl: `${explorer}/tx/0xabc` };
    await route.fulfill({ json: { success: true, data } });
  });
  return () => ({ posts, legacy });
}
async function send(page: Page) {
  await page.getByLabel('Recipient', { exact: true }).fill('0712345678');
  await page.getByLabel('Amount', { exact: true }).fill('0.01');
  await page.getByRole('button', { name: 'Review payment', exact: true }).click();
  await page.getByLabel('NexusPay password').fill('fixture-password');
  await page.getByRole('button', { name: 'Confirm and send', exact: true }).click();
}
test('home network selection reaches the send form; one POST is followed by confirmation reads', async ({ page }) => {
  const calls = await setup(page);
  await page.goto('/home', {waitUntil: 'domcontentloaded'});
  await page.getByRole('combobox').first().click();
  await page.getByRole('option', { name: 'BOT Chain', exact: true }).click();
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(page.getByLabel('Network', { exact: true })).toHaveValue('botchain');
  await send(page);
  await expect(page.getByText('Payment submitted', { exact: true })).toBeVisible();
  await expect(page.getByText('Payment confirmed', { exact: true })).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('link', { name: 'View on explorer' })).toHaveAttribute('href', 'https://scan.botchain.ai/tx/0xabc');
  expect(calls()).toEqual({ posts: 1, legacy: 0 });
});
test('password rejection preserves the selected network and explains the failure', async ({ page }) => {
  const calls = await setup(page, true);
  await page.goto('/crypto', {waitUntil: 'domcontentloaded'});
  await page.getByLabel('Network', { exact: true }).selectOption('botchain');
  await send(page);
  await expect(page.getByText('Enter your NexusPay account password.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page.getByLabel('Network', { exact: true })).toHaveValue('botchain');
  expect(calls()).toEqual({ posts: 1, legacy: 0 });
});
test('BOT mainnet uses the mainnet payment route, native fee notice and explorer', async ({ page }) => {
  const calls = await setup(page, false, 'botchain');
  await page.goto('/home', {waitUntil: 'domcontentloaded'});
  await page.getByRole('combobox').first().click();
  await page.getByRole('option', { name: 'BOT Chain', exact: true }).click();
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(page.getByLabel('Network', { exact: true })).toHaveValue('botchain');
  await expect(page.getByText('Network fee paid separately in BOT.', { exact: false })).toBeVisible();
  await send(page);
  await expect(page.getByText('Payment confirmed', { exact: true })).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('link', { name: 'View on explorer' })).toHaveAttribute('href', 'https://scan.botchain.ai/tx/0xabc');
  expect(calls()).toEqual({ posts: 1, legacy: 0 });
});
test('public ecosystem page shows both required links and honest network status', async ({ page }) => {
  await setup(page);
  await page.goto('/ecosystem', {waitUntil: 'domcontentloaded'});
  const footer = page.getByRole('contentinfo', { name: 'NexusPay ecosystem' });
  await expect(footer.getByRole('link', { name: 'BOT Chain website' })).toHaveAttribute('href', 'https://botchain.ai');
  await expect(footer.getByRole('link', { name: 'BOT Chain explorer' })).toHaveAttribute('href', 'https://scan.botchain.ai');
  await expect(page.getByText('Payments enabled', { exact: false })).toBeVisible();
  await expect(page.getByRole('region', { name: 'BOT network availability' }).getByText('Test assets only', { exact: false })).toHaveCount(0);
});
