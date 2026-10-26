import { test, expect, type Page } from "@playwright/test";
const wallet = "0x1111111111111111111111111111111111111111";
const token = `e30.${Buffer.from(JSON.stringify({ id: "111111111111111111111111", exp: 4102444800 })).toString("base64url")}.fixture`;
const user = {
  id: "111111111111111111111111",
  walletAddress: wallet,
  phoneNumber: "+254712345678",
  token,
};
async function setup(page: Page, signedIn = true, rampEnabled = true) {
  if (signedIn)
    await page.addInitScript(
      ({ user, token }) => {
        localStorage.setItem("nexuspay_user", JSON.stringify(user));
        localStorage.setItem("nexuspay_token", token);
      },
      { user, token },
    );
  await page.route("https://accounts.google.com/**", (route) => route.abort());
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    let data: unknown = {};
    if (path.endsWith("/token/receive"))
      return route.fulfill({
        json: {
          success: true,
          data: { walletAddress: wallet, supportedChains: [], balances: {} },
        },
      });
    if (path.endsWith("/mpesa/capabilities"))
      data = {
        modes: { buy: rampEnabled, withdraw: rampEnabled, bills: rampEnabled },
        networks: [{ id: "arbitrum", name: "Arbitrum", tokens: ["USDC"] }],
        sandbox: false,
        message: rampEnabled ? null : "M-Pesa payments are not available yet.",
      };
    else if (path.endsWith("/mpesa/quote"))
      data = {
        fiatAmount: 1000,
        cryptoAmount: "7.500000",
        serviceFee: "0",
        rate: 133.33,
        expiresAt: new Date(Date.now() + 60000).toISOString(),
      };
    else if (path.includes("/token/balance"))
      data = {
        walletAddress: wallet,
        exactBalances: { USDC: "10", USDT: "10" },
        balances: {},
        totalUSDValue: 0,
      };
    else if (path.endsWith("/token/networks"))
      data = [
        {
          id: "arbitrum",
          name: "Arbitrum",
          chainId: 42161,
          transfers: true,
          tokens: [{ symbol: "USDC", decimals: 6 }],
        },
      ];
    else if (path.endsWith("/botchain/networks"))
      data = [
        {
          id: "botchain",
          name: "BOT Chain",
          chainId: 677,
          enabled: true,
          transfers: true,
          merchantPayments: true,
          testnet: false,
          tokens: [
            { symbol: "USDT", decimals: 6 },
            { symbol: "BOT", decimals: 18 },
          ],
        },
      ];
    else if (path.endsWith("/botchain/botchain/balances"))
      data = {
        address: wallet,
        balances: [
          { symbol: "USDT", balance: "10" },
          { symbol: "BOT", balance: "1" },
        ],
      };
    else if (path.endsWith("/botchain/botchain/quote"))
      data = {
        maxNetworkFee: "0.00001",
        totalBotDebit: "0.00001",
        expiresAt: new Date(Date.now() + 60000).toISOString(),
      };
    else if (path.includes("/business/find/"))
      data = { merchantId: "NX-STORE", businessName: "Verified Corner Shop" };
    else if (path.includes("/business/my-businesses"))
      data = { businesses: [], totalCount: 0 };
    else if (path.endsWith("/transactions/history"))
      data = { transactions: [], pagination: { total: 0 } };
    await route.fulfill({ json: { success: true, data } });
  });
}

test("phone login accepts international numbers and pasted OTP without modal dialogs", async ({
  page,
}) => {
  await setup(page, false);
  let logins = 0;
  await page.route("**/auth/login", (route) => {
    logins++;
    expect(route.request().postDataJSON()).toEqual({
      phoneNumber: "+14155552671",
      password: "long-password-with-more-than-20-characters",
    });
    return route.fulfill({
      json: { success: true, data: { phoneNumber: "+14155552671" } },
    });
  });
  await page.route("**/auth/login/verify", (route) => {
    expect(route.request().postDataJSON()).toEqual({
      phoneNumber: "+14155552671",
      otp: "123456",
    });
    return route.fulfill({ json: { success: true, data: { ...user, token } } });
  });
  await page.goto("/login");
  await page
    .getByLabel("Phone number", { exact: true })
    .fill("+1 (415) 555-2671");
  await page
    .getByLabel("Password", { exact: true })
    .fill("long-password-with-more-than-20-characters");
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "type",
    "text",
  );
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Check your messages" }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Resend in/ })).toBeDisabled();
  await page.getByLabel("Verification code").fill("123456");
  await page.getByRole("button", { name: "Verify and sign in" }).click();
  await expect(page).toHaveURL(/\/home$/);
  expect(logins).toBe(1);
});
test("failed sign-in keeps the form and gives a useful inline error", async ({
  page,
}) => {
  await setup(page, false);
  await page.route("**/auth/login", (route) =>
    route.fulfill({
      status: 401,
      json: {
        success: false,
        error: { message: "Check your phone number and password." },
      },
    }),
  );
  await page.goto("/login");
  await page.getByLabel("Phone number", { exact: true }).fill("0712345678");
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Check your phone number" }),
  ).toContainText("Check your phone number");
  await expect(page.getByLabel("Phone number", { exact: true })).toHaveValue(
    "0712345678",
  );
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("Buy reviews the amount and tracks pending settlement without claiming success or resubmitting on reload", async ({
  page,
}) => {
  await setup(page);
  let posts = 0;
  await page.route("**/mpesa/buy-crypto", (route) => {
    posts++;
    expect(route.request().headers()["idempotency-key"]).toBeTruthy();
    expect(route.request().postDataJSON()).toEqual({
      chain: "arbitrum",
      tokenType: "USDC",
      amount: 1000,
      phone: "+254712345678",
    });
    return route.fulfill({
      json: {
        success: true,
        data: { transactionId: "buy-1", status: "processing" },
      },
    });
  });
  await page.route("**/mpesa/transaction/buy-1", (route) =>
    route.fulfill({
      json: {
        success: true,
        data: { transactionId: "buy-1", status: "processing" },
      },
    }),
  );
  await page.goto("/buy-crypto");
  await expect(page.getByLabel("Pay from M-Pesa number")).toHaveValue(
    "+254712345678",
  );
  await page.getByLabel("Amount (KES)", { exact: true }).fill("1000");
  await page.getByRole("button", { name: "Review payment" }).click();
  await expect(page.getByText("7.500000 USDC")).toBeVisible();
  expect(posts).toBe(0);
  await page.getByRole("button", { name: "Send M-Pesa prompt" }).click();
  await expect(
    page.getByRole("heading", { name: "Check your M-Pesa phone" }),
  ).toBeVisible();
  await expect(page.getByText("Money added", { exact: true })).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Check your M-Pesa phone" }),
  ).toBeVisible();
  expect(posts).toBe(1);
});
test("Buy blocks payment when the provider or rate is unavailable", async ({
  page,
}) => {
  await setup(page, true, false);
  await page.goto("/buy-crypto");
  await expect(
    page.getByRole("status").filter({ hasText: "not available yet" }),
  ).toContainText("not available yet");
  await expect(
    page.getByRole("button", { name: "Review payment" }),
  ).toBeDisabled();
});
test("a quote failure prevents an M-Pesa prompt", async ({ page }) => {
  await setup(page);
  await page.route("**/mpesa/quote", (route) =>
    route.fulfill({
      status: 503,
      json: {
        success: false,
        message: "A current exchange rate is unavailable.",
      },
    }),
  );
  await page.goto("/buy-crypto");
  await page.getByLabel("Amount (KES)", { exact: true }).fill("1000");
  await page.getByRole("button", { name: "Review payment" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "exchange rate is unavailable" }),
  ).toContainText("exchange rate is unavailable");
  await expect(
    page.getByRole("button", { name: "Send M-Pesa prompt" }),
  ).toBeDisabled();
});
test("Pay verifies the merchant and fee before authorization and reports pending honestly", async ({
  page,
}) => {
  await setup(page);
  let posts = 0;
  await page.route("**/botchain/botchain/transfers", (route) => {
    posts++;
    expect(route.request().postDataJSON()).toMatchObject({
      merchantId: "NX-STORE",
      amount: "1",
      maxNetworkFee: "0.00001",
      password: "test-password",
    });
    return route.fulfill({
      json: {
        success: true,
        data: {
          id: "payment-1",
          status: "pending",
          network: "botchain",
          tokenSymbol: "USDT",
          amount: "1",
          createdAt: new Date().toISOString(),
        },
      },
    });
  });
  await page.goto("/pay");
  await page.getByLabel("Merchant ID", { exact: true }).fill("NX-STORE");
  await page.getByLabel("Network", { exact: true }).selectOption("botchain");
  await page.getByLabel("Amount", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Review payment" }).click();
  await expect(page.getByRole("dialog")).toContainText("Verified Corner Shop");
  await expect(page.getByRole("dialog")).toContainText("0.00001 BOT maximum");
  expect(posts).toBe(0);
  await page
    .getByLabel("NexusPay password", { exact: true })
    .fill("test-password");
  await page.getByRole("button", { name: "Confirm and pay" }).click();
  await expect(
    page.getByRole("heading", { name: "Payment submitted" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Make another payment" }),
  ).toHaveCount(0);
  expect(posts).toBe(1);
});
test("bill payments require an account for Paybill and withdrawals show available balance", async ({
  page,
}) => {
  await setup(page);
  await page.goto("/pay");
  await page
    .getByRole("button", { name: "Till / Paybill", exact: true })
    .click();
  await page.getByRole("button", { name: "Paybill", exact: true }).click();
  await page.getByLabel("Paybill number").fill("123456");
  await page.getByLabel("Amount (KES)", { exact: true }).fill("1000");
  await expect(
    page.getByRole("button", { name: "Review payment" }),
  ).toBeDisabled();
  await page.getByLabel("Account number").fill("INV-123");
  await expect(
    page.getByRole("button", { name: "Review payment" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Withdraw", exact: true }).click();
  await expect(page.getByText("Available: 10 USDC")).toBeVisible();
  await page.getByLabel("Amount (USDC)", { exact: true }).fill("2");
  await page.getByRole("button", { name: "Review payment" }).click();
  await expect(page.getByLabel("NexusPay password")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Confirm payment" }),
  ).toBeDisabled();
});

test("a lost Buy response recovers its payment reference without sending another prompt", async ({
  page,
}) => {
  await setup(page);
  let posts = 0;
  await page.route("**/mpesa/buy-crypto", (route) => {
    posts++;
    return route.fulfill({
      status: 503,
      json: {
        success: false,
        message: "Connection interrupted",
        error: { paymentStarted: true },
      },
    });
  });
  await page.route("**/mpesa/requests/*", (route) =>
    route.fulfill({
      json: {
        success: true,
        data: {
          payment: { transactionId: "recovered-1", status: "processing" },
        },
      },
    }),
  );
  await page.route("**/mpesa/transaction/recovered-1", (route) =>
    route.fulfill({
      json: {
        success: true,
        data: { transactionId: "recovered-1", status: "processing" },
      },
    }),
  );
  await page.goto("/buy-crypto");
  await page.getByLabel("Amount (KES)", { exact: true }).fill("1000");
  await page.getByRole("button", { name: "Review payment" }).click();
  await page.getByRole("button", { name: "Send M-Pesa prompt" }).click();
  await expect(page.getByText("recovered-1", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Check your M-Pesa phone" }),
  ).toBeVisible();
  expect(posts).toBe(1);
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status === "passed")
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  if (process.env.NEXUSPAY_UI_SCREENSHOTS === "true")
    await page.screenshot({
      path: testInfo.outputPath("screen.png"),
      fullPage: true,
    });
});
