import { test, expect, type Page } from "@playwright/test";

const legacy = "0x1111111111111111111111111111111111111111";
const bot = "0x2222222222222222222222222222222222222222";
const recipient = "0x3333333333333333333333333333333333333333";
const token = `e30.${Buffer.from(JSON.stringify({ id: "111111111111111111111111", exp: 4102444800 })).toString("base64url")}.fixture`;
const capability = {
  id: "botchain",
  name: "BOT Chain",
  chainId: 677,
  enabled: true,
  testnet: false,
  transfers: true,
  tokens: [
    { symbol: "USDT", decimals: 6 },
    { symbol: "BOT", decimals: 18 },
  ],
};

async function prepare(page: Page, accountFails = false) {
  let sends = 0;
  await page.addInitScript(
    ({ token, legacy }) => {
      localStorage.setItem("nexuspay_token", token);
      localStorage.setItem(
        "nexuspay_user",
        JSON.stringify({
          id: "111111111111111111111111",
          name: "Test Owner",
          email: "owner@example.test",
          walletAddress: legacy,
          token,
        }),
      );
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: async (text: string) => {
            (window as any).copiedAddress = text;
          },
        },
      });
    },
    { token, legacy },
  );
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/botchain/botchain/quote')) return route.fulfill({json: {success: true, data: {maxNetworkFee: '0.00001', walletFee: '0.00001', totalBotDebit: '0.02001', feeCurrency: 'BOT', expiresAt: new Date(Date.now() + 60000).toISOString()}}});
    if (path.endsWith('/botchain/botchain/balances')) return route.fulfill({status: accountFails ? 503 : 200, json: {success: !accountFails, data: {network: 'botchain', address: bot, balances: [{symbol: 'USDT', decimals: 6, balance: '20.123456', balanceUnits: '20123456'}, {symbol: 'BOT', decimals: 18, balance: '0.123456789012345678', balanceUnits: '123456789012345678'}]}}});
    if (path.endsWith('/botchain/botchain/max')) return route.fulfill({json: {success: true, data: {amount: '0.120456789012345678', gasReserve: '0.003', balance: '0.123456789012345678', recipient}}});
    if (path.endsWith("/botchain/botchain/account"))
      return route.fulfill({
        status: accountFails ? 503 : 200,
        json: {
          success: !accountFails,
          data: { network: "botchain", address: bot, gasMode: "self-funded" },
        },
      });
    if (
      path.endsWith("/botchain/botchain/transfers") &&
      route.request().method() === "POST"
    ) {
      sends++;
      expect(route.request().postDataJSON()).toMatchObject({
        amount: "1",
        tokenSymbol: "USDT",
        recipientIdentifier: "+254712345678",
        password: "test-password",
      });
      expect(route.request().postDataJSON()).not.toHaveProperty(
        "senderAddress",
      );
      expect(route.request().headers()["idempotency-key"]).toBeTruthy();
      return route.fulfill({
        json: {
          success: true,
          data: {
            id: "222222222222222222222222",
            network: "botchain",
            sender: bot,
            recipient,
            amount: "1",
            tokenSymbol: "USDT",
            status: "pending",
            createdAt: new Date().toISOString(),
          },
        },
      });
    }
    if (path.endsWith("/token/sendToken"))
      throw new Error("BOT payment reached the legacy transfer endpoint");
    let data: unknown = {};
    if (path.endsWith("/botchain/networks")) data = [capability];
    else if (path.endsWith("/token/networks"))
      data = [
        {
          id: "arbitrum",
          name: "Arbitrum",
          tokens: [{ symbol: "USDC", decimals: 6 }],
          transfers: true,
        },
      ];
    else if (path.endsWith("/token/receive"))
      data = {
        walletAddress: legacy,
        supportedChains: [],
        email: "owner@example.test",
      };
    else if (path.includes("/token/balance"))
      data = { walletAddress: legacy, balances: {}, exactBalances: {USDC: "10"}, totalUSDValue: 0 };
    else if (path.includes("/business/my-businesses"))
      data = { businesses: [], totalCount: 0 };
    else if (path.includes("/transfers/"))
      data = {
        id: "222222222222222222222222",
        network: "botchain",
        sender: bot,
        recipient,
        amount: "1",
        tokenSymbol: "USDT",
        status: "pending",
        createdAt: new Date().toISOString(),
      };
    await route.fulfill({ json: { success: true, data } });
  });
  return () => sends;
}

test("BOT receiving QR, copy action and explorer use the BOT account", async ({
  page,
}) => {
  await prepare(page);
  await page.goto("/receive", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Receiving network").selectOption("botchain");
  await expect(page.getByTestId("receive-address")).toHaveText(bot);
  await expect(page.locator("svg title")).toHaveText(
    `BOT Chain receiving address: ${bot}`,
  );
  await page.getByRole("button", { name: "Copy BOT Chain address" }).click();
  expect(await page.evaluate(() => (window as any).copiedAddress)).toBe(bot);
  await expect(
    page.getByRole("link", { name: "View on explorer" }),
  ).toHaveAttribute("href", `https://scan.botchain.ai/address/${bot}`);
  await page.getByLabel("Receiving network").selectOption("base");
  await expect(page.getByTestId("receive-address")).toHaveText(legacy);
  await expect(page.locator("svg title")).toHaveText(
    `Base receiving address: ${legacy}`,
  );
});

test("BOT address failure never falls back to the generic EVM QR or copy action", async ({
  page,
}) => {
  await prepare(page, true);
  await page.goto("/receive", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Receiving network").selectOption("botchain");
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "couldn't load your BOT Chain address" }),
  ).toBeVisible();
  await expect(page.getByTestId("receive-address")).toHaveCount(0);
  await expect(page.locator("svg title")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Copy BOT Chain address" }),
  ).toHaveCount(0);
});

test("legacy routes lead to the current receive and password-authorized send screens", async ({
  page,
}) => {
  const sends = await prepare(page);
  for (const path of ["/receive/share-qr", "/receive/amount"]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/receive$/);
  }
  await page.goto("/send", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/crypto$/);
  await page.getByLabel("Network", { exact: true }).selectOption("botchain");
  await page.getByLabel("Asset", { exact: true }).selectOption("USDT");
  await page.getByLabel("Recipient", { exact: true }).fill("0712345678");
  await page.getByLabel("Amount", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Review payment", exact: true }).click();
  await page.locator('input[type="password"]').fill("test-password");
  await page.getByRole("button", { name: "Confirm and send", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Payment submitted" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Waiting for network confirmation. You can safely leave this page and follow the payment in your history.",
    ),
  ).toBeVisible();
  expect(sends()).toBe(1);
  await expect(
    page.getByRole("heading", { name: "Transaction Successful!" }),
  ).toHaveCount(0);
});


test('shows exact balance, fills Max and rejects overspending before review', async ({ page }) => {
  const sends = await prepare(page);
  await page.goto('/crypto', {waitUntil: 'domcontentloaded'});
  await page.getByLabel('Network', {exact: true}).selectOption('botchain');
  await expect(page.getByText('20.123456 USDT', {exact: true})).toBeVisible();
  await page.getByRole('button', {name: 'Max', exact: true}).click();
  await expect(page.getByLabel('Amount', {exact: true})).toHaveValue('20.123456');
  await page.getByLabel('Recipient', {exact: true}).fill('0712345678');
  await page.getByLabel('Amount', {exact: true}).fill('20.123457');
  await expect(page.getByText('Amount exceeds your available USDT balance.')).toBeVisible();
  await expect(page.getByRole('button', {name: 'Review payment'})).toBeDisabled();
  await page.getByLabel('Amount', {exact: true}).fill('1.1234567');
  await expect(page.getByRole('button', {name: 'Review payment'})).toBeDisabled();
  expect(sends()).toBe(0);
});

test('native BOT Max reserves gas and retains all 18 decimal places', async ({ page }) => {
  const sends = await prepare(page);
  await page.goto('/crypto', {waitUntil: 'domcontentloaded'});
  await page.getByLabel('Network', {exact: true}).selectOption('botchain');
  await page.getByLabel('Asset', {exact: true}).selectOption('BOT');
  await page.getByRole('button', {name: 'Max', exact: true}).click();
  await expect(page.getByText('Enter the recipient first so we can estimate the BOT network fee.')).toBeVisible();
  await page.getByLabel('Recipient', {exact: true}).fill('0712345678');
  await page.getByRole('button', {name: 'Max', exact: true}).click();
  await expect(page.getByLabel('Amount', {exact: true})).toHaveValue('0.120456789012345678');
  await expect(page.getByText('0.003 BOT kept for network fees. The final fee may change.')).toBeVisible();
  await page.getByRole('button', {name: 'Review payment'}).click();
  await expect(page.getByRole('dialog')).toContainText('+254712345678');
  await expect(page.getByRole('dialog')).toContainText('BOT Chain');
  await expect(page.getByRole('button', {name: 'Confirm and send'})).toBeDisabled();
  expect(sends()).toBe(0);
  await page.getByRole('button', {name: 'Edit payment'}).click();
  await page.getByLabel('Network', {exact: true}).selectOption('arbitrum');
  await expect(page.getByLabel('Amount', {exact: true})).toHaveValue('');
});

test('unavailable balance disables Max and payment review', async ({ page }) => {
  const sends = await prepare(page, true);
  await page.goto('/crypto', {waitUntil: 'domcontentloaded'});
  await page.getByLabel('Network', {exact: true}).selectOption('botchain');
  await expect(page.getByText('Balance unavailable')).toBeVisible();
  await expect(page.getByRole('button', {name: 'Max', exact: true})).toBeDisabled();
  await expect(page.getByRole('button', {name: 'Review payment'})).toBeDisabled();
  expect(sends()).toBe(0);
});

test('review shows the BOT fee and password can be shown and hidden without sending', async ({ page }) => {
  const sends = await prepare(page);
  await page.goto('/crypto', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Network', { exact: true }).selectOption('botchain');
  await page.getByLabel('Asset', { exact: true }).selectOption('BOT');
  await page.getByLabel('Recipient', { exact: true }).fill(recipient);
  await page.getByLabel('Amount', { exact: true }).fill('0.02');
  await page.getByRole('button', { name: 'Review payment', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('0.00001 BOT maximum');
  await expect(page.getByRole('dialog')).toContainText('0.02001 BOT');
  const password = page.getByLabel('NexusPay password', { exact: true });
  await password.fill('test-password');
  await page.getByRole('button', { name: 'Show password', exact: true }).click();
  await expect(password).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Hide password', exact: true }).click();
  await expect(password).toHaveAttribute('type', 'password');
  await expect(page.getByRole('button', { name: 'Confirm and send' })).toBeEnabled();
  expect(sends()).toBe(0);
});
test('unavailable fee blocks confirmation even with a password', async ({ page }) => {
  const sends = await prepare(page);
  await page.route('**/botchain/botchain/quote', route => route.fulfill({status: 503, json: {success: false, error: {message: 'Fee service unavailable'}}}));
  await page.goto('/crypto', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Network', { exact: true }).selectOption('botchain');
  await page.getByLabel('Recipient', { exact: true }).fill(recipient);
  await page.getByLabel('Amount', { exact: true }).fill('1');
  await page.getByRole('button', { name: 'Review payment', exact: true }).click();
  await page.getByLabel('NexusPay password', { exact: true }).fill('test-password');
  await expect(page.getByRole('dialog')).toContainText('Unavailable');
  await expect(page.getByRole('button', { name: 'Confirm and send' })).toBeDisabled();
  expect(sends()).toBe(0);
});
