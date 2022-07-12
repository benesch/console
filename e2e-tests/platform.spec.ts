import { APIRequestContext, Page, test } from "@playwright/test";
import assert from "assert";
import CacheableLookup from "cacheable-lookup";
import { Client } from "pg";

import { sleep } from "../frontend/src/util";
import { CONSOLE_ADDR, EMAIL, IS_KIND, STATE_NAME, TestContext } from "./util";

/**
 * Setup state storage
 */
test.afterEach(async ({ page }) => {
  // Update the refresh token for future tests.
  await page.context().storageState({ path: STATE_NAME });
});

test(`connecting to the environment controller`, async ({ page, request }) => {
  test.setTimeout(120000);

  const context = await TestContext.start(page, request);
  const name = "Environment controller test token";
  const { clientId, secret } = await context.fronteggRequest(
    "/identity/resources/users/api-tokens/v1",
    { method: "POST", data: { description: name } }
  );
  const password = `mzp_${clientId}${secret}`;
  await page.goto(`${CONSOLE_ADDR}/platform`);

  // close welcome modal
  await Promise.race([
    exitWelcomeModal(page),
    page.selectOption('select[name="environment-select"]', "+ Edit Regions"),
  ]);

  await page.waitForSelector("table tbody tr");
  const regionRows = page.locator("table tbody tr");
  const regionsNames = [];

  for (let i = 0; i < (await regionRows.count()); i++) {
    const row = regionRows.nth(i);
    const regionName = await row.locator("td").first().innerText();
    regionsNames.push(regionName);

    await row.locator('button:text("Enable region")').click();
  }

  await page.click("[aria-label='Close']", { force: true });

  for (const regionName of regionsNames) {
    await page.selectOption("[aria-label='Environment']", {
      label: regionName,
    });
    sleep(500);
    await testPlatformEnvironment(page, request, password);
  }
});

async function exitWelcomeModal(page: Page) {
  await page.click('[aria-label="Close"]');
  await page.click('button:has-text("Enable Region")');
}

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
