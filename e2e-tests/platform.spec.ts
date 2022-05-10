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
    const buttonLabel = await fields.nth(2).innerText();
    if (buttonLabel.startsWith("Destroy")) {
      // Delete an old env if one exists.
      await row.locator('button:text("Destroy")').click();
      page.type("[aria-modal] input", region);
      await Promise.all([
        page.waitForSelector("[aria-modal]", { state: "detached" }),
        page.click("[aria-modal] button:text('Destroy')"),
      ]);
    }
    await row.locator('button:text("Enable region")').click();
    await page.click("[aria-modal] button:text('Enable')");
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
  await client.query("SET CLUSTER = c");
  if (!IS_KIND) {
    // This S3 bucket lives in the "Materialize Sample Data" AWS account and is
    // managed in the i2 repository.
    await client.query(`CREATE MATERIALIZED SOURCE engagement
      FROM S3 DISCOVER OBJECTS MATCHING 'engagement.csv'
      USING BUCKET SCAN 'materialize-sample-data'
      WITH (
          role_arn = 'arn:aws:iam::137301051720:role/sample-data-reader',
          region = 'us-east-1'
      )
      FORMAT CSV WITH HEADER (id, status, active_time);`);
  } else {
    // In Minikube, we won't have access to the S3 bucket, so just create a
    // table with the expected contents. This still tests that the cluster
    // can be created and perform computation.
    await client.query(
      "CREATE TABLE engagement (id text, status text, active_time text, mz_record integer)"
    );
    await client.query(
      `INSERT INTO engagement VALUES
        ('9999', 'active', '8 hours', 1),
        ('888', 'inactive', '', 2),
        ('777', 'active', '3 hours', 3)
      `
    );
  }
  // Try reading from the source repeatedly to give it time to populate. This
  // won't be necessary once the following issue is resolved:
  // https://github.com/MaterializeInc/materialize/issues/11048
  for (let i = 0; i < 30; i++) {
    try {
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
  password: string,
  row: Locator
): Promise<Client> {
  await row
    .locator("td >> text=/^postgres:/")
    .waitFor({ timeout: 10 * 60 * 1000 });

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
    connectionTimeoutMillis: 5 * 10000,
    // 10 minute query timeout, because spinning up a cluster can involve
    // turning on new EC2 machines, which may take many minutes.
    query_timeout: 10 * 60 * 1000,
  };
  for (let i = 0; i < 60; i++) {
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
