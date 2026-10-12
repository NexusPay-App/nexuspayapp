import { test, expect } from '@playwright/test';
test.use({ serviceWorkers: 'allow' });
test('offline navigation shows the public fallback and never caches account data', async ({ page, context }) => {
  await page.goto('/home');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise<void>(resolve => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }));
    const cache = await caches.open('nexuspay-public-v2');
    const requests = await cache.keys();
    if (requests.some(request => new URL(request.url).pathname !== '/offline.html')) throw new Error('Unexpected private cache entry');
  });
  await context.setOffline(true);
  await page.goto('/home');
  await expect(page.getByRole('heading', { name: "You're offline" })).toBeVisible();
  await expect(page.getByText('Connect to the internet to check balances or make a payment.')).toBeVisible();
});
