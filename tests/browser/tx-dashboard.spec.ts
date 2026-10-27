import { test, expect, type Page } from '@playwright/test';

const outgoing = {
  id: 'b1',
  network: 'botchain',
  token: 'USDT',
  amount: '0.5',
  direction: 'outgoing',
  status: 'completed',
  type: 'token_transfer',
  txHash: '0xabc',
  explorerUrl: 'https://scan.botchain.ai/tx/0xabc',
  createdAt: '2026-10-26T12:00:00.000Z',
};

const incomingFailed = {
  id: 'b2',
  network: 'botchain-testnet',
  token: 'BOT',
  amount: '0.02',
  direction: 'incoming',
  status: 'failed',
  type: 'token_transfer',
  txHash: null,
  explorerUrl: null,
  createdAt: '2026-10-12T09:00:00.000Z',
};

const arbitrumRow = {
  id: 'tx-legacy-1',
  network: 'arbitrum',
  token: 'USDT',
  amount: '4',
  direction: 'outgoing',
  status: 'completed',
  type: 'token_transfer',
  txHash: '0xdef',
  explorerUrl: 'https://arbiscan.io/tx/0xdef',
  createdAt: '2026-10-20T09:00:00.000Z',
};

async function serveFeed(page: Page) {
  const searches: string[] = [];
  await page.route('**/api/public/transactions*', async route => {
    const url = new URL(route.request().url());
    searches.push(url.search);
    const network = url.searchParams.get('network');
    const rows = network === 'arbitrum' ? [arbitrumRow] : [outgoing, incomingFailed];
    await route.fulfill({
      json: { success: true, data: { transactions: rows, summary: { total: rows.length, returned: rows.length, network: network || 'all' } } },
    });
  });
  return searches;
}

test('shows the public feed without a password and labels direction', async ({ page }) => {
  // Deliberately no token, no localStorage session: the dashboard must work logged out.
  const searches = await serveFeed(page);
  await page.goto('/tx-dashboard', { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: 'NexusPay transactions' })).toBeVisible();
  await expect(page).toHaveURL(/\/tx-dashboard$/);

  const feed = page.getByRole('region', { name: 'Public transaction feed' });
  await expect(feed.getByText('Sent', { exact: true })).toBeVisible();
  await expect(feed.getByText('Received', { exact: true })).toBeVisible();
  await expect(feed.getByText('-0.5 USDT', { exact: true })).toBeVisible();
  await expect(feed.getByText('+0.02 BOT', { exact: true })).toBeVisible();
  // Mobile and desktop status chips both exist in the DOM; exactly one is visible per viewport.
  await expect(feed.getByText('Failed', { exact: true }).locator('visible=true')).toHaveCount(1);
  await expect(
    page.getByRole('link', { name: 'View transaction on explorer' }),
  ).toHaveAttribute('href', 'https://scan.botchain.ai/tx/0xabc');

  await page.getByRole('button', { name: 'Arbitrum', exact: true }).click();
  await expect.poll(() => searches.some(search => search.includes('network=arbitrum'))).toBe(true);
  await expect(feed.getByText('-4 USDT', { exact: true })).toBeVisible();
  await expect(feed.getByText('BOT Chain', { exact: true })).toHaveCount(0);
});

test('keeps the feed fresh with automatic polling and a manual refresh', async ({ page }) => {
  const searches = await serveFeed(page);
  await page.goto('/tx-dashboard', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('region', { name: 'Public transaction feed' }).getByText('Sent', { exact: true })).toBeVisible();
  const initial = searches.length;

  // Automatic refresh runs every 15 seconds.
  await expect.poll(() => searches.length, { timeout: 20_000 }).toBeGreaterThan(initial);

  const before = searches.length;
  await page.getByRole('button', { name: 'Refresh transactions' }).click();
  await expect.poll(() => searches.length).toBeGreaterThan(before);
});
