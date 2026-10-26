import { test, expect } from "@playwright/test";

const token = `e30.${Buffer.from(JSON.stringify({ id: "111111111111111111111111", exp: 4102444800 })).toString("base64url")}.fixture`;
const user = {
  id: "111111111111111111111111",
  name: "Ada Owner",
  email: "ada@example.test",
  phoneNumber: "+254700000000",
  token,
};
const business = {
  businessId: "222222222222222222222222",
  businessName: "Acacia Studio",
  businessType: "Design",
  merchantId: "NX-123456789",
  phoneNumber: user.phoneNumber,
  walletAddress: "0x1111111111111111111111111111111111111111",
  creditLimit: 0,
  overdraftEnabled: false,
  pinSet: true,
  isVerified: false,
};

async function prepare(
  page: import("@playwright/test").Page,
  options: {
    authenticated?: boolean;
    deliveryFails?: boolean;
    completionFails?: boolean;
  } = {},
) {
  let requests = 0,
    completions = 0;
  await page.addInitScript(
    ({ authenticated, user, token }) => {
      if (authenticated) {
        localStorage.setItem("nexuspay_token", token);
        localStorage.setItem("nexuspay_user", JSON.stringify(user));
      }
    },
    { authenticated: options.authenticated ?? true, user, token },
  );
  await page.route("https://accounts.google.com/gsi/client", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `window.google={accounts:{id:{initialize(config){window.googleCallback=config.callback},renderButton(el){const b=document.createElement('button');b.textContent='Continue with Google';b.onclick=()=>window.googleCallback({credential:'fixture-google-token'});el.appendChild(b)}}}};`,
    }),
  );
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/business/request-upgrade")) {
      requests++;
      expect(route.request().headers().authorization).toBe(`Bearer ${token}`);
      expect(route.request().postDataJSON()).not.toHaveProperty("userId");
      return route.fulfill({
        status: options.deliveryFails ? 503 : 200,
        json: {
          success: !options.deliveryFails,
          message: options.deliveryFails
            ? "Code delivery unavailable"
            : "Code sent",
          data: { retryAfter: 60 },
        },
      });
    }
    if (path.endsWith("/business/complete-upgrade")) {
      completions++;
      expect(route.request().postDataJSON()).toMatchObject({
        otp: "123456",
        pin: "639274",
        phoneNumber: user.phoneNumber,
      });
      return route.fulfill({
        status: options.completionFails ? 400 : 200,
        json: options.completionFails
          ? { success: false, message: "Invalid or expired code" }
          : {
              success: true,
              data: {
                business,
                session: {
                  verified: true,
                  verifiedAt: new Date().toISOString(),
                  expiresAt: new Date(Date.now() + 1800000).toISOString(),
                  businessId: business.businessId,
                  businessName: business.businessName,
                  merchantId: business.merchantId,
                },
              },
            },
      });
    }
    if (path.endsWith("/auth/google"))
      return route.fulfill({ json: { success: true, data: { token, user } } });
    if (path.endsWith("/auth/register/initiate"))
      return route.fulfill({ json: { success: true, message: "Code sent" } });
    if (path.endsWith("/auth/register"))
      return route.fulfill({ json: { success: true, data: { token, user } } });
    if (path.endsWith("/auth/login"))
      return route.fulfill({ json: { success: true, data: {} } });
    if (path.endsWith("/auth/login/verify"))
      return route.fulfill({ json: { success: true, data: { token, user } } });
    let data: unknown = {};
    if (path.endsWith("/auth/google-config"))
      data = { clientId: "fixture.apps.googleusercontent.com" };
    if (path.endsWith("/business/my-businesses"))
      data = { businesses: [], totalCount: 0 };
    if (path.includes("/networks")) data = [];
    if (path.includes("/receive"))
      data = { walletAddress: business.walletAddress, supportedChains: [] };
    if (path.includes("/token/balance"))
      data = { balances: {}, totalUSDValue: 0 };
    await route.fulfill({ json: { success: true, data } });
  });
  return { counts: () => ({ requests, completions }) };
}

async function fillDetails(page: import("@playwright/test").Page) {
  await expect(page.getByLabel("Your full name", { exact: true })).toHaveValue(
    "Ada Owner",
  );
  await page.getByLabel("Business name", { exact: true }).fill("Acacia Studio");
  await page.getByLabel("Country", { exact: true }).fill("Kenya");
  await page.getByLabel("City / town", { exact: true }).fill("Nairobi");
  await page.getByLabel("Business category", { exact: true }).fill("Design");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
}

async function fillSecurity(page: import("@playwright/test").Page) {
  await page.getByLabel("Verification code", { exact: true }).fill("123456");
  await page.getByLabel("New PIN", { exact: true }).fill("639274");
  await page.getByLabel("Confirm PIN", { exact: true }).fill("639274");
}

test("business setup preserves drafts, clears secrets, and opens the receiving screen", async ({
  page,
}, testInfo) => {
  const api = await prepare(page);
  await page.goto("/signup/business");
  await expect(page.getByText("User ID", { exact: true })).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Make it your business." }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("details.png"),
    fullPage: true,
  });
  await fillDetails(page);
  await fillSecurity(page);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Secure your business wallet." }),
  ).toBeVisible();
  await expect(page.getByLabel("New PIN", { exact: true })).toHaveValue("");
  await expect(
    page.getByLabel("Verification code", { exact: true }),
  ).toHaveValue("");
  await fillSecurity(page);
  await page.screenshot({
    path: testInfo.outputPath("security.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Create business wallet", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Ready for your first payment." }),
  ).toBeVisible();
  await expect(page.getByText("NX-123456789", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Acacia Studio NexusPay payment QR" }),
  ).toBeVisible();
  expect(api.counts()).toEqual({ requests: 1, completions: 1 });
  expect(
    await page.evaluate(() =>
      Object.keys(sessionStorage).filter((key) =>
        key.startsWith("nexuspay-business-setup:"),
      ),
    ),
  ).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("ready.png"),
    fullPage: true,
  });
});

test("delivery failure retains the form and never claims verification succeeded", async ({
  page,
}) => {
  const api = await prepare(page, { deliveryFails: true });
  await page.goto("/signup/business");
  await fillDetails(page);
  await expect(page.locator("main [role=alert]")).toContainText(
    "Code delivery unavailable",
  );
  await expect(page.getByLabel("Business name", { exact: true })).toHaveValue(
    "Acacia Studio",
  );
  expect(api.counts()).toEqual({ requests: 1, completions: 0 });
});

test("invalid PIN confirmation and wrong codes cannot reach success", async ({
  page,
}) => {
  const api = await prepare(page, { completionFails: true });
  await page.goto("/signup/business");
  await fillDetails(page);
  await fillSecurity(page);
  await page.getByLabel("Confirm PIN", { exact: true }).fill("222222");
  await page.getByRole("button", { name: "Create business wallet" }).click();
  await expect(page.locator("main [role=alert]")).toContainText(
    "PINs do not match",
  );
  expect(api.counts().completions).toBe(0);
  await page.getByLabel("Confirm PIN", { exact: true }).fill("639274");
  await page.getByRole("button", { name: "Create business wallet" }).click();
  await expect(page.locator("main [role=alert]")).toContainText(
    "Invalid or expired code",
  );
  await expect(
    page.getByRole("heading", { name: "Ready for your first payment." }),
  ).toHaveCount(0);
});

test("signed-out users get a clear entry and Google returns directly to business setup", async ({
  page,
}) => {
  await prepare(page, { authenticated: false });
  await page.goto("/business/create");
  await expect(page).toHaveURL(/\/signup\/business$/);
  await expect(
    page.getByRole("heading", { name: "Your business starts here." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Continue with phone and password" }),
  ).toHaveAttribute("href", "/login?next=/signup/business");
  await page
    .getByRole("button", { name: "Continue with Google", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Make it your business." }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/signup\/business$/);
});

test("phone registration keeps the business destination", async ({ page }) => {
  await prepare(page, { authenticated: false });
  await page.goto("/signup?next=/signup/business");
  await page.locator('input[name="phoneNumber"]').fill("0700000000");
  await page.locator('input[name="password"]').fill("Fixture-only123!");
  await page.locator('input[name="confirmPassword"]').fill("Fixture-only123!");
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  for (let i = 0; i < 6; i++)
    await page.locator(`[data-signup-index="${i}"]`).fill(String(i + 1));
  await page.getByRole("button", { name: "Confirm OTP Code" }).click();
  await expect(page).toHaveURL(/\/signup\/business$/);
  await expect(
    page.getByRole("heading", { name: "Make it your business." }),
  ).toBeVisible();
});


for (const route of ['/login', '/signup']) {
  test(`Google from ${route} stays in business setup after authentication`, async ({ page }) => {
    await prepare(page, { authenticated: false });
    await page.goto(`${route}?next=/signup/business`);
    await page.getByRole('button', { name: 'Continue with Google', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Make it your business.' })).toBeVisible();
    await page.waitForTimeout(1200);
    await expect(page).toHaveURL(/\/signup\/business$/);
  });
}

test('phone login returns to business setup after verification', async ({ page }) => {
  await prepare(page, { authenticated: false });
  await page.goto('/login?next=/signup/business');
  await page.locator('input[name="phoneNumber"]').fill('0700000000');
  await page.locator('input[name="password"]').fill('Fixture-only123!');
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  const inputs = page.getByRole('dialog').locator('input[maxlength="1"]');
  for (let i = 0; i < 6; i++) await inputs.nth(i).fill(String(i + 1));
  await page.getByRole('button', { name: 'Verify', exact: true }).click();
  await expect(page).toHaveURL(/\/signup\/business$/);
});
