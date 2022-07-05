import { APIRequestContext, Page, test } from "@playwright/test";
import assert from "assert";
import CacheableLookup from "cacheable-lookup";
import { Client } from "pg";

import { CONSOLE_ADDR, EMAIL, IS_KIND, STATE_NAME, TestContext } from "./util";

/**
 * Setup state storage
 */
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
  const password = `mzp_${clientId}${secret}`;
  await page.goto(`${CONSOLE_ADDR}/platform`);

  // await Promise.race([
  //   exitWelcomeModal(page),
  //   page.selectOption('select[name="environment-select"]', "+ Edit Regions"),
  // ]);

  // await page.click("text='+ Enable Region'");

  await page.waitForSelector("table tbody tr");
  const regionRows = page.locator("table tbody tr");

  for (let i = 0; i < (await regionRows.count()); i++) {
    const row = regionRows.nth(i);
    await row.locator('button:text("Enable region")').click();
    // await page.click("text='Enable'");
  }

  await page.click("[aria-label='Close']");

  await testPlatformEnvironment(page, request, password);
});

async function testPlatformEnvironment(
  page: Page,
  request: APIRequestContext,
  password: string
) {
  const client = await connectRegionPostgres(page, password);
  console.log("Creating cluster.");
  await client.query("CREATE CLUSTER c REPLICAS (r1 (size 'xsmall'));");
  console.log("Setting cluster.");
  await client.query("SET CLUSTER = c;");
  // if (!IS_KIND) {
  //   console.log("Creating S3 source.");

  //   // This S3 bucket lives in the "Materialize Sample Data" AWS account and is
  //   // managed in the i2 repository.
  //   await client.query(`CREATE MATERIALIZED SOURCE engagement
  //     FROM S3 DISCOVER OBJECTS MATCHING 'engagement.csv'
  //     USING BUCKET SCAN 'materialize-sample-data'
  //     WITH (
  //         role_arn = 'arn:aws:iam::137301051720:role/sample-data-reader',
  //         region = 'us-east-1'
  //     )
  //     FORMAT CSV WITH HEADER (id, status, active_time);`);
  // } else {
  console.log("Creating table.");

  // In Minikube, we won't have access to the S3 bucket, so just create a
  // table with the expected contents. This still tests that the cluster
  // can be created and perform computation.
  await client.query(
    "CREATE TABLE engagement (id text, status text, active_time text, mz_record integer);"
  );

  console.log("Insert values into table.");
  await client.query(
    `INSERT INTO engagement VALUES
        ('9999', 'active', '8 hours', 1),
        ('888', 'inactive', '', 2),
        ('777', 'active', '3 hours', 3);
      `
  );
  // }
  // Try reading from the source repeatedly to give it time to populate. This
  // won't be necessary once the following issue is resolved:
  // https://github.com/MaterializeInc/materialize/issues/11048
  for (let i = 0; i < 30; i++) {
    try {
      console.log("Select results from table.");

      const result = await client.query(
        "SELECT id, status, active_time FROM engagement ORDER BY mz_record"
      );
      assert.deepStrictEqual(result.rows, [
        { id: "9999", status: "active", active_time: "8 hours" },
        { id: "888", status: "inactive", active_time: "" },
        { id: "777", status: "active", active_time: "3 hours" },
      ]);
      return;
    } catch (error) {
      console.log(error);
      await page.waitForTimeout(1000);
    }
  }
  throw new Error("source never contained expected records");
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
