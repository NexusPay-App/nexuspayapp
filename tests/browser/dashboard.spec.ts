import { test, expect } from '@playwright/test';

test('wallet keeps activity above the fold and preserves receipts, refresh and payment navigation', async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on('pageerror', error => runtimeErrors.push(error.message));
  await page.addInitScript(() => {
    const token = `e30.${btoa(JSON.stringify({ exp: 4102444800 }))}.fixture`;
    localStorage.setItem('nexuspay_token', token);
    localStorage.setItem('nexuspay_user', JSON.stringify({ walletAddress: '0x1111111111111111111111111111111111111111', email: 'fixture@example.test', token }));
  });
  await page.route('https://api.exchangerate-api.com/**', route => route.fulfill({ json: { rates: { KES: 129.87 } } }));
  let historyReads = 0;
  let failHistory = false;
  let emptyHistory = false;
  const transactions = ['completed', 'pending', 'failed', 'error', 'processing'].map((status, index) => ({
    id: `fixture-${index}`, type: 'token_transfer', transactionSubType: 'sent', status,
    token: { symbol: 'USDT', name: 'Tether', amount: [100, 20, 50, 1, 2][index], decimals: 6 },
    values: { usd: { formatted: `$${[100, 20, 50, 1, 2][index].toFixed(2)}` }, kes: { formatted: 'KES 12,987' }, fiat: { formatted: 'KES 12,987' } },
    blockchain: { chain: 'botchain', network: 'BOT Chain', txHash: '0x123', explorerUrl: 'https://scan.botchain.ai/tx/0x123', explorerName: 'BOT Explorer' },
    timing: { createdAt: '2026-10-15T12:00:00Z', ageMinutes: 14400, processingTimeSeconds: 2 },
  }));
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    let data: unknown = {};
    if (path.endsWith('/botchain/networks')) data = [{ id: 'botchain', name: 'BOT Chain', chainId: 677, enabled: true, transfers: true, testnet: false, tokens: [{ symbol: 'USDT', decimals: 6 }] }];
    else if (path.endsWith('/token/networks')) data = [{ id: 'arbitrum', name: 'Arbitrum', chainId: 42161, tokens: [{ symbol: 'USDC', decimals: 6 }] }];
    else if (path.endsWith('/token/receive')) data = { walletAddress: '0x1111111111111111111111111111111111111111', supportedChains: [{ id: 'arbitrum', name: 'Arbitrum' }], supportedTokens: ['USDC', 'USDT'] };
    else if (path.endsWith('/token/balance')) data = { balances: { arbitrum: { USDC: 0.679147, USDT: 0.407824 } }, totalUSDValue: 1.09, supportedChains: ['arbitrum'], lastUpdated: new Date().toISOString() };
    else if (path.includes('/token/balance/')) data = { chain: 'botchain', balances: { USDT: 500 }, totalUSDValue: 500 };
    else if (path.endsWith('/transactions/history')) {
      historyReads++;
      if (failHistory) return route.fulfill({ status: 500, json: { success: false } });
      data = { transactions: emptyHistory ? [] : transactions, pagination: { total: 5 } };
    }
    await route.fulfill({ json: { success: true, data } });
  });
  await page.goto('/home');
  const activity = page.getByRole('region', { name: 'Recent transactions' });
  const first = activity.getByRole('button', { name: /View details: Sent, 100 USDT/ });
  await expect(first).toBeInViewport();
  await expect(activity.getByText('Pending', { exact: true }).filter({ visible: true })).toBeVisible();
  await expect(activity.getByText('Failed', { exact: true }).filter({ visible: true })).toBeVisible();
  await expect(page.getByText(/API Status:|transactions loaded|Clear Cache/)).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath('dashboard.png'), fullPage: true });
  await first.click();
  const receipt = page.getByRole('dialog');
  await expect(receipt.getByRole('heading', { name: 'Transaction details', exact: true })).toBeVisible();
  await expect(receipt.getByRole('link', { name: 'View on Explorer' })).toHaveAttribute('href', 'https://scan.botchain.ai/tx/0x123');
  await page.keyboard.press('Escape');
  await expect(receipt).toHaveCount(0);
  const before = historyReads;
  failHistory = true;
  await page.getByRole('button', { name: 'Refresh transactions' }).click();
  await expect(activity.getByRole('alert')).toContainText('Unable to load your recent transactions');
  failHistory = false;
  emptyHistory = true;
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByText('No transactions yet')).toBeVisible();
  expect(historyReads).toBeGreaterThan(before);
  emptyHistory = false;
  await page.getByRole('button', { name: 'Refresh transactions' }).click();
  await expect(first).toBeVisible();
  await page.getByRole('combobox', { name: 'Select network' }).click();
  await page.getByRole('option', { name: 'BOT Chain', exact: true }).click();
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(page.getByLabel('Chain', { exact: true })).toHaveValue('botchain');
  for (const [label, route] of [['Receive', '/receive'], ['Pay', '/pay'], ['Buy', '/buy-crypto']]) {
    await page.goto('/home');
    await page.getByRole('button', { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${route}$`));
  }
  expect(runtimeErrors).toEqual([]);
});
