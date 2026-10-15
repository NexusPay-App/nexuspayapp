import { test, expect } from '@playwright/test';
for (const deliveryFails of [false, true]) {
  test(deliveryFails ? 'signup explains delivery failure without opening verification' : 'signup consumes one code and opens the authenticated wallet', async ({ page }) => {
    let registrations = 0, extraLogins = 0;
    await page.addInitScript(() => localStorage.setItem('pwa-install-dismissed', String(Date.now())));
    await page.route('https://accounts.google.com/gsi/client', route => route.fulfill({ contentType: 'application/javascript', body: 'window.google = { accounts: { id: { initialize() {}, renderButton() {} } } };' }));
    await page.route('**/api/**', async route => {
      const path = new URL(route.request().url()).pathname;
      if (path.endsWith('/auth/register/initiate')) return route.fulfill({ status: deliveryFails ? 503 : 200, json: { success: !deliveryFails, message: deliveryFails ? 'Verification delivery unavailable' : 'Code sent' } });
      if (path.endsWith('/auth/register')) {
        registrations++;
        expect(route.request().postDataJSON()).toMatchObject({ phoneNumber: '+254712345678', otp: '123456', verifyWith: 'phone' });
        const token = `e30.${Buffer.from(JSON.stringify({ exp: 4102444800 })).toString('base64url')}.fixture`;
        return route.fulfill({ json: { success: true, data: { token, walletAddress: '0x1111111111111111111111111111111111111111', phoneNumber: '+254712345678' } } });
      }
      if (path.endsWith('/auth/login') || path.endsWith('/register/verify/phone')) extraLogins++;
      let data: unknown = {};
      if (path.endsWith('/auth/google-config')) data = { clientId: 'fixture.apps.googleusercontent.com' };
      else if (path.endsWith('/networks')) data = [];
      else if (path.endsWith('/transactions/history')) data = { transactions: [], pagination: { total: 0 } };
      else if (path.includes('/token/balance')) data = { balances: {}, totalUSDValue: 0 };
      await route.fulfill({ json: { success: true, data } });
    });
    await page.goto('/signup');
    await page.locator('input[name="phoneNumber"]').fill('0712345678');
    await page.locator('input[name="password"]').fill('Fixture-only123!');
    await page.locator('input[name="confirmPassword"]').fill('Fixture-only123!');
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    if (deliveryFails) {
      await expect(page.getByText('Verification delivery unavailable', { exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Confirm OTP Code' })).not.toBeVisible();
      expect(registrations).toBe(0);
    } else {
      await expect(page.getByRole('button', { name: 'Confirm OTP Code' })).toBeVisible();
      for (let i = 0; i < 6; i++) await page.locator(`[data-signup-index="${i}"]`).fill(String(i + 1));
      await page.getByRole('button', { name: 'Confirm OTP Code' }).click();
      await expect(page).toHaveURL(/\/home$/);
      expect(await page.evaluate(() => Boolean(localStorage.getItem('nexuspay_token')))).toBe(true);
      expect(registrations).toBe(1);
    }
    expect(extraLogins).toBe(0);
  });
}
