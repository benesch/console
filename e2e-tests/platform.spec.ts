import { APIRequestContext, Locator, Page, test } from "@playwright/test";
import { Client } from "pg";

import {
  CONSOLE_ADDR,
  EMAIL,
  IS_MINIKUBE,
  STATE_NAME,
  TestContext,
} from "./util";

test.afterEach(async ({ page }) => {
  // Update the refresh token for future tests.
  await page.context().storageState({ path: STATE_NAME });
});

test(`connecting to the environment controller`, async ({ page, request }) => {
  const context = await TestContext.start(page, request);
  const name = "Environment controller test token";
  const { clientId, secret } = await context.fronteggRequest(
    "/identity/resources/users/api-tokens/v1",
    { method: "POST", data: { description: name } }
  );
  const password = `{clientId}{secret}`;
  console.log("environment-controller password", password);

  await page.goto(`${CONSOLE_ADDR}/platform/regions`);
  await page.waitForSelector("table tbody tr");
  const regionRows = page.locator("table tbody tr");
  // TODO: This is wrong. We have to do the UI parts in sequence, but
  // once both regions are refreshed & enabled, we can connect in
  // parallel:
  await Promise.all(
    Array(await regionRows.count())
      .fill(0)
      .map((_, rowN) =>
        // will be awaited as part of the Promise.all above:
        testPlatformEnvironment(page, request, password, regionRows.nth(rowN))
      )
  );
});

async function testPlatformEnvironment<T>(
  page: Page,
  request: APIRequestContext,
  password: string,
  row: Locator
) {
  const fields = row.locator("td");
  const region = await fields.first().innerText();
  console.log("Running on", region);
  const startURL = await fields.nth(1).innerText();
  console.log("Running on inner promise", region);
  if (startURL.startsWith("postgres")) {
    // Delete an old env if one exists.
    await row.locator("button").click();
    page.type("[aria-modal] input", region);
    await Promise.all([
      page.waitForSelector("[aria-modal]", { state: "detached" }),
      page.click("[aria-modal] button:text('Destroy')"),
    ]);
  }
  const createButton = row.locator('button:text("Enable region")');
  await createButton.click();
  await Promise.all([
    page.click("[aria-modal] button:text('Enable')"),
    row.locator("td >> text=/^postgres:/").waitFor(),
  ]);

  const url = new URL(await fields.nth(1).innerText());
  const pgParams = {
    user: EMAIL,
    host: url.hostname,
    port: url.port,
    database: url.pathname.slice(1),
    password,
    ssl: IS_MINIKUBE ? undefined : { rejectUnauthorized: false },
    connectionTimeoutMillis: 1000,
    query_timeout: 1000,
  };
  for (let i = 0; i < 600; i++) {
    try {
      const client = new Client(pgParams);
      await client.connect();
      await client.query("SELECT 1;");
    } catch (error) {
      console.log(error);
      await page.waitForTimeout(1000);
    }
  }
}
