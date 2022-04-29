import { APIRequestContext, Locator, Page, test } from "@playwright/test";
import assert from "assert";
import { Client } from "pg";

import { CONSOLE_ADDR, EMAIL, IS_KIND, STATE_NAME, TestContext } from "./util";

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
  const password = `${clientId}${secret}`;
  console.log("environment-controller password", password);

  await page.goto(`${CONSOLE_ADDR}/platform/regions`);
  await page.waitForSelector("table tbody tr");
  const regionRows = page.locator("table tbody tr");
  // Clean up existing environments and spin them up again - we do
  // this in sequence because it's happening in the UI with modals.
  // TODO: replace the cleanup with API calls:
  for (let i = 0; i < (await regionRows.count()); i++) {
    const row = regionRows.nth(i);
    const fields = row.locator("td");
    await Promise.race([
      // expect any of the two buttons to be visible:
      row.locator('button:text("Destroy")').waitFor(),
      row.locator('button:text("Enable region")').waitFor(),
    ]);
    const region = await fields.first().innerText();
    const startURL = await fields.nth(1).innerText();
    if (startURL.startsWith("postgres")) {
      // Delete an old env if one exists.
      await row.locator('button:text("Destroy")').click();
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
  }

  // Next, connect to each environment's environment, simultaneously:
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
  const client = await connectRegionPostgres(page, password, row);
  await client.query("CREATE CLUSTER c SIZE 'xsmall';");
  await client.query("CREATE TABLE t (a int);");
  await client.query("INSERT INTO t VALUES (42);");
  await client.query("SET CLUSTER = c");
  const result = await client.query("SELECT * FROM t");
  assert.deepStrictEqual(result.rows, [{ a: 42 }]);
}

async function connectRegionPostgres(
  page: Page,
  password: string,
  row: Locator
): Promise<Client> {
  const fields = row.locator("td");

  const url = new URL(await fields.nth(1).innerText());
  const pgParams = {
    user: EMAIL,
    host: url.hostname,
    port: parseInt(url.port, 10),
    database: url.pathname.slice(1),
    password,
    ssl: IS_KIND ? undefined : { rejectUnauthorized: false },
    // 5 second connection timeout, because Frontegg authentication can be slow.
    connectionTimeoutMillis: 5 * 1000,
    // 2 minute query timeout, because spinning up a cluster can be slow.
    query_timeout: 2 * 60 * 1000,
  };
  for (let i = 0; i < 600; i++) {
    try {
      const client = new Client(pgParams);
      await client.connect();
      return client;
    } catch (error) {
      console.log(error);
      await page.waitForTimeout(1000);
    }
  }
  throw new Error("unable to connect to region");
}
