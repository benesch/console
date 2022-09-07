import { APIRequestContext, Page, test } from "@playwright/test";
import assert from "assert";
import CacheableLookup from "cacheable-lookup";
import { Client } from "pg";

import { EMAIL, IS_KIND, STATE_NAME, CONSOLE_ADDR, TestContext } from "./util";

/**
 * Setup state storage
 */
test.afterEach(async ({ page }) => {
  // Update the refresh token for future tests.
  await page.context().storageState({ path: STATE_NAME });
});

test(`enable region`, async ({ page, request }) => {
  // This is about fifteen minutes. It is a lot but also it takes a lot to
  // deploy.
  test.setTimeout(1000000);

  const context = await TestContext.start(page, request);
  const now = new Date().getTime();
  const name = `Integration test token ${now}`;
  await context.deleteAllKeysOlderThan(2);
  await page.goto(`${CONSOLE_ADDR}/access`);

  // Create api key
  console.log("Creating app-specific password", name);
  await page.waitForSelector("text=Generate new password");
  await page.fill("form [name=name]", name);
  await page.click("form button:text('Submit')");
  await page.waitForSelector(`text=New password "${name}"`);
  // TODO: test copy to clipboard button once playwright supports that
  const passwordField = await page.waitForSelector(
    `css=[aria-label="clientId"]`
  );
  const password = await passwordField.evaluate((e) => e.textContent);
  assert(!!password, "Expected a password to be created");

  const appPasswords = await context.listAllKeys();
  console.log("app passwords now", appPasswords);

  // Navigate to the platform dashboard.
  await page.click('a:has-text("Dashboard")');

  // Click each enable region button.
  await page.waitForSelector(
    "[data-test-id='regions-list'] .regions-list-item"
  );
  const regionRows = page.locator(
    "[data-testid='regions-list'] .regions-list-item"
  );
  const regionsNames = [];
  for (let i = 0; i < (await regionRows.count()); i++) {
    const row = regionRows.nth(i);
    const regionName = await row.locator(" > div").first().innerText();
    regionsNames.push(regionName);

    await row.locator('button:text("Enable region")').click();
  }
  await Promise.all(
    regionsNames.map(async (regionName) => {
      await page.selectOption("[aria-label='Environment']", {
        label: regionName,
      });
      await testPlatformEnvironment(page, request, password);
    })
  );
  // Delete api key
  await page.goto(`${CONSOLE_ADDR}/access`);
  await page.click(`[aria-label='${name}'] [aria-label='Delete password']`);
  await page.type("[aria-modal] input", name);
  await Promise.all([
    page.waitForSelector("[aria-modal]", { state: "detached" }),
    page.click("[aria-modal] button:text('Delete')"),
  ]);
  await page.waitForSelector(`text=${name}`, { state: "detached" });
});

async function testPlatformEnvironment(
  page: Page,
  request: APIRequestContext,
  password: string
) {
  /**
   * Currently tables and some sort of Materialized Views don't work (due to persistence?)
   * With this approach at least the critical platform test for deployments is checked.
   */
  const client = await connectRegionPostgres(page, password);
  console.log("Creating cluster.");
  await client.query("CREATE CLUSTER c REPLICAS (r1 (size 'xsmall'));");
  console.log("Setting cluster.");
  await client.query("SET CLUSTER = c;");
  console.log("Creating materialized view.");
  await client.query(`
      CREATE MATERIALIZED VIEW series AS SELECT generate_series(0, 1000) as serie_number;
    `);
  console.log("Creating index.");
  await client.query(`
      CREATE INDEX test_idx ON series (serie_number);
    `);
  console.log("Selecting results.");
  const { rowCount: indexCount } = await client.query(`
      SELECT * FROM series WHERE serie_number = 5;
    `);

  assert.equal(indexCount, 1);
  return;
}

async function connectRegionPostgres(
  page: Page,
  password: string
): Promise<Client> {
  await page.selectOption("[aria-label='Connection option']", {
    label: "external tool",
  });
  const hostAddress = await page
    .locator("data-test-id=cs_Host >> button >> p")
    .innerText();
  const port = await page
    .locator("data-test-id=cs_Port >> button >> p")
    .innerText();
  const database = await page
    .locator("data-test-id=cs_Database >> button >> p")
    .innerText();

  if (hostAddress) {
    const url = new URL(
      hostAddress.startsWith("http") ? hostAddress : `http://${hostAddress}`
    );
    const dns = new CacheableLookup({
      maxTtl: 0, // always re-lookup
      errorTtl: 0,
    });

    for (let i = 0; i < 60; i++) {
      try {
        const entry = await dns.lookupAsync(url.hostname);
        const pgParams = {
          user: EMAIL,
          host: entry.address,
          port: parseInt(port, 10),
          database: database,
          password,
          ssl: IS_KIND ? undefined : { rejectUnauthorized: false },
          // 5 second connection timeout, because Frontegg authentication can be slow.
          connectionTimeoutMillis: 50000,
          // 10 minute query timeout, because spinning up a cluster can involve
          // turning on new EC2 machines, which may take many minutes.
          query_timeout: 600000,
        };

        const client = new Client(pgParams);
        await client.connect();
        return client;
      } catch (error) {
        console.log(error);
        await page.waitForTimeout(1000);
      }
    }

    throw new Error("unable to connect to region");
  } else {
    throw new Error("unable to connect to region");
  }
}
