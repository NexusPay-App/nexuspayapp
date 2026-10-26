import { test, expect } from '@playwright/test';
test('BOT Chain sends through the shared multi-chain send screen', async ({ page }) => {
  const address = '0x1111111111111111111111111111111111111111';
  await page.addInitScript(() => {
    const token = `e30.${btoa(JSON.stringify({ exp: 4102444800 }))}.fixture`;
    localStorage.setItem('nexuspay_token', token);
    localStorage.setItem('nexuspay_user', JSON.stringify({ walletAddress: '0x9999999999999999999999999999999999999999', email: 'fixture@example.test', token }));
  });
  let sent = 0;
  let sendTokenCalls = 0;
  let confirmed = false;
  const keys: string[] = [];
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url());
    let data: unknown = {};
    if (url.pathname.endsWith('/botchain/botchain/quote')) return route.fulfill({json: {success: true, data: {maxNetworkFee: '0.00001', walletFee: '0.00001', totalBotDebit: '0.02001', feeCurrency: 'BOT', expiresAt: new Date(Date.now() + 60000).toISOString()}}});
    if (url.pathname.endsWith('/botchain/networks')) data = [{ id: 'botchain', name: 'BOT Chain', chainId: 677, enabled: true, transfers: true, merchantPayments: true, testnet: false, explorer: 'https://scan.botchain.ai', tokens: [{ symbol: 'USDT', decimals: 6, address: '0xaBabc7Ddc03e501d190C676BF3d92ef0e6e87a3C' }, { symbol: 'BOT', decimals: 18, address: null }, { symbol: 'WBOT', decimals: 18, address: '0xD5452816194a3784dBa983426cCe7c122F4abd30' }] }, { id: 'botchain-testnet', name: 'BOT Chain Testnet', chainId: 968, enabled: true, transfers: true, merchantPayments: true, testnet: true, explorer: 'https://scan.bohr.life' }];
    else if (url.pathname.endsWith('/token/networks')) data = [{ id: 'arbitrum', name: 'Arbitrum', chainId: 42161, tokens: [{ symbol: 'USDC', name: 'USD Coin', decimals: 6 }] }];
    else if (url.pathname.endsWith('/botchain/botchain/balances')) data = {address, balances: [{symbol: 'USDT', balance: '20'}, {symbol: 'BOT', balance: '1'}]};
    else if (url.pathname.includes('/transfers/payment-')) data = {id: 'payment-1', network: 'botchain', sender: address, recipient: address, amount: '1.000001', tokenSymbol: 'USDT', status: confirmed ? 'confirmed' : 'pending', createdAt: new Date().toISOString()};
    else if (url.pathname.endsWith('/token/receive')) { await route.fulfill({ json: { success: true, data: { walletAddress: address } } }); return; }
    else if (url.pathname.endsWith('/token/sendToken')) sendTokenCalls++;
    else if (url.pathname.endsWith('/botchain/botchain/transfers') && route.request().method() === 'POST') {
      const body = route.request().postDataJSON();
      expect(body.amount).toBe('1.000001'); expect(body.senderAddress).toBeUndefined();
      const key = route.request().headers()['idempotency-key'];
      expect(key).toBeTruthy(); keys.push(key); sent++;
      data = { id: sent < 3 ? 'payment-1' : 'payment-2', network: 'botchain', sender: address, recipient: body.recipientIdentifier, amount: body.amount, tokenSymbol: 'USDT', status: sent === 1 ? 'pending' : confirmed ? 'confirmed' : 'pending', userOpHash: '0xabc', createdAt: new Date().toISOString() };
    } else if (url.pathname.endsWith('/token/balance')) data = { walletAddress: address, totalUSDValue: 0, balances: {}, chainsWithBalance: 0, supportedChains: ['arbitrum'], lastUpdated: new Date().toISOString() };
    await route.fulfill({ json: { success: true, data } });
  });

  // Shared send screen: load, then select the BOT network in the same chain selector as every other chain.
  await page.goto('/crypto', {waitUntil: 'domcontentloaded'});
  const chainSelect = page.getByLabel('Network', { exact: true });
  await expect(chainSelect.locator('option', { hasText: 'BOT Chain' })).toHaveCount(1);
  // Even a stale API advertising enabled testnet must not expose it to users.
  await expect(chainSelect.locator('option[value="botchain-testnet"]')).toHaveCount(0);
  const tokenSelect = page.locator('#tokenType');
  const selectBotChain = async () => {
    await chainSelect.selectOption('botchain');
    // Token options become chain-valid (no legacy USDC on BOT) before submitting.
    await expect(tokenSelect.locator('option')).toHaveText(['USDT', 'BOT']);
    await expect(tokenSelect).toHaveValue('USDT');
  };
  await selectBotChain();

  const submit = async () => {
    await page.getByLabel('Recipient', { exact: true }).fill('fixture@example.test');
    await page.getByLabel('Amount', { exact: true }).fill('1.000001');
    await page.getByRole('button', { name: 'Review payment' }).click();
    await page.getByLabel('NexusPay password').fill('fixture-password');
    await page.getByRole('button', { name: 'Confirm and send', exact: true }).click();
  };

  // First submit: pending is never presented as successful.
  await submit();
  await expect(page.getByText('Payment submitted')).toBeVisible();
  await expect(page.getByText('Payment confirmed', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Waiting for network confirmation. You can safely leave this page and follow the payment in your history.')).toBeVisible();
  expect(sent).toBe(1);
  expect(sendTokenCalls).toBe(0); // BOT never falls through to the legacy send endpoint
  await expect(page.getByRole('button', {name: 'Make another payment'})).toHaveCount(0);
  confirmed = true;
  await expect(page.getByText('Payment confirmed', {exact: true})).toBeVisible({timeout: 15000});
  expect(sent).toBe(1);
  await page.getByRole('button', {name: 'Make another payment'}).click();
  await selectBotChain();
  await submit();
  await expect.poll(() => sent).toBe(2);
  expect(keys[1]).not.toBe(keys[0]);
});
