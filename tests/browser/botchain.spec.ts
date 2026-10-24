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
    if (url.pathname.endsWith('/botchain/networks')) data = [{ id: 'botchain', name: 'BOT Chain', chainId: 677, enabled: true, transfers: true, merchantPayments: true, testnet: false, explorer: 'https://scan.botchain.ai', tokens: [{ symbol: 'USDT', decimals: 6, address: '0xaBabc7Ddc03e501d190C676BF3d92ef0e6e87a3C' }, { symbol: 'BOT', decimals: 18, address: null }, { symbol: 'WBOT', decimals: 18, address: '0xD5452816194a3784dBa983426cCe7c122F4abd30' }] }, { id: 'botchain-testnet', name: 'BOT Chain Testnet', chainId: 968, enabled: true, transfers: true, merchantPayments: true, testnet: true, explorer: 'https://scan.bohr.life' }];
    else if (url.pathname.endsWith('/token/networks')) data = [{ id: 'arbitrum', name: 'Arbitrum', chainId: 42161, tokens: [{ symbol: 'USDC', name: 'USD Coin', decimals: 6 }] }];
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
  await page.goto('/crypto');
  const chainSelect = page.getByLabel('Chain', { exact: true });
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
    await page.getByRole('button', { name: 'Send Crypto' }).click();
    await page.getByPlaceholder('Enter your account password').fill('fixture-password');
    await page.getByRole('button', { name: 'Send', exact: true }).click();
  };

  // First submit: pending is never presented as successful.
  await submit();
  await expect(page.getByText('Payment Submitted')).toBeVisible();
  await expect(page.getByText('Transaction Successful!', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Pending confirmation on BOT Chain. This is not confirmed yet.')).toBeVisible();
  expect(sent).toBe(1);
  expect(sendTokenCalls).toBe(0); // BOT never falls through to the legacy send endpoint
  await page.getByRole('button', { name: 'Done' }).click();

  // Retry with identical details: the durable idempotency key is reused.
  confirmed = true;
  await selectBotChain();
  await submit();
  await expect(page.getByText('Transaction Successful!', { exact: true })).toBeVisible();
  expect(keys[1]).toBe(keys[0]);
  await page.getByRole('button', { name: 'Done' }).click();

  // After a terminal result a new payment gets a fresh key.
  await selectBotChain();
  await submit();
  await expect.poll(() => sent).toBe(3);
  expect(keys[2]).not.toBe(keys[0]);
});
