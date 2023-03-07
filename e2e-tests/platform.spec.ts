import { APIRequestContext, Page, test } from "@playwright/test";
import assert from "assert";
import CacheableLookup from "cacheable-lookup";
import { Client } from "pg";

import {
  CONSOLE_ADDR,
  EMAIL,
  getRegionControllerUrl,
  IS_KIND,
  PLATFORM_REGIONS,
  STATE_NAME,
  TestContext,
} from "./util";

/**
 * Setup state storage
 */
test.afterEach(async ({ page }) => {
  // Update the refresh token for future tests.
  await page.context().storageState({ path: STATE_NAME });
});

enum DashboardState {
  NoRegions,
  SomeRegionsActive,
  ThisRegionActive,
}

async function reactSelectOption(page: Page, elementId: string, value: string) {
  await page.click(`#${elementId}`);
  await page.waitForSelector(`#${elementId} .custom-option`);
  await page.click(`#${elementId} .custom-option :has-text("${value}")`);
}

for (const region of PLATFORM_REGIONS) {
  test(`use region ${region}`, async ({ page, request }) => {
    test.setTimeout(1000000); // spinning up a region can be slow.

    const context = await TestContext.start(page, request);
    const now = new Date().getTime();
    const apiKeyName = `Integration test token ${now}`;
    await context.deleteAllKeysOlderThan(2);

    // Create api key
    await page.goto(`${CONSOLE_ADDR}/access`);
    console.log("Creating app password", apiKeyName);
    await page.click("button:text('New app password')");
    await page.waitForSelector("text=New app password");
    await page.fill("form [name=name]", apiKeyName);
    await page.click("form button:text('Create password')");
    await page.waitForSelector(`text=New password "${apiKeyName}"`);
    // TODO: test copy to clipboard button once playwright supports that
    const passwordField = await page.waitForSelector(
      `css=[aria-label="clientId"]`
    );
    const password = await passwordField.evaluate((e) => e.textContent);
    assert(!!password, "Expected a password to be created");
    const appPasswords = await context.listAllKeys();
    console.log("app passwords now", appPasswords);

    await page.click('data-test-id=nav-lg >> a:has-text("Connect")');

    if (context.fronteggAPIEnabled) {
      // Validate that blocked accounts cannot spin up environments. We only
      // run this on staging for parity with the Console repo. Our API tests
      // will ensure there's test coverage on both staging and prod.
      await testAccountBlocking(context, region);
    }

    // Activate the region in the onboarding table if we have no regions
    // active, otherwise pick one in the selector and use it.
    const regionState = await Promise.race([
      (async () => {
        await page.waitForSelector(
          `[data-test-id=regions-list] button[title="Enable ${region}"]`
        );
        return DashboardState.NoRegions;
      })(),
      (async () => {
        await reactSelectOption(page, "environment-select", region);
        return await Promise.race([
          (async () => {
            await page.waitForSelector('text="Connect to Materialize"');
            return DashboardState.ThisRegionActive;
          })(),
          (async () => {
            // TODO: Sleep 5s here, because there's a flash of incorrect state when selecting regions.
            await new Promise((resolve) => setTimeout(resolve, 5000));
            await page.waitForSelector(
              `text="Region ${region} is not enabled"`
            );
            return DashboardState.SomeRegionsActive;
          })(),
        ]);
      })(),
    ]);
    switch (regionState) {
      case DashboardState.NoRegions:
        console.log("No regions yet activated, activating ours.");
        await page.click(
          `[data-test-id=regions-list] button[title="Enable ${region}"]`
        );
        break;

      case DashboardState.ThisRegionActive:
        console.log("Re-using active region");
        // TODO: If we hit this, we may be seeing a bug.
        // I need to think through this case a bit more.
        break;

      case DashboardState.SomeRegionsActive:
        console.log("Activating yet-inactive region");
        await page.click(`Enable ${region}`);
        break;

      default:
        console.log("welp, this is broken!");
    }
    await testPlatformEnvironment(page, request, password);

    //// Delete api key
    await page.goto(`${CONSOLE_ADDR}/access`);
    await page.click(
      `[aria-label='${apiKeyName}'] [aria-label='Delete password']`
    );
    await page.type("[aria-modal] input", apiKeyName);
    await Promise.all([
      page.waitForSelector("[aria-modal]", { state: "detached" }),
      page.click("[aria-modal] button:text('Delete')"),
    ]);
    await page.waitForSelector(`text=${apiKeyName}`, { state: "detached" });
  });
}

async function testAccountBlocking(context: TestContext, region: string) {
  try {
    // Set the blocked state
    console.info("Marking tenant as blocked");
    await context.setFronteggTenantBlockedStatus(true);
    const regionUrl = getRegionControllerUrl(region);

    try {
      // Attempt to create an environment...
      console.info("Attempting to create an environment");
      await context.apiRequest(`${regionUrl}/api/environmentassignment`, {
        method: "POST",
        data: {},
      });
      throw new Error("Tenant was not blocked from creating an environment");
    } catch (err: unknown) {
      if (err instanceof Error) {
        // We anticipate getting a 403 error for blocked accounts. If that's not what we got, rethrow the error
        if (!err.message.includes("API Error 403")) {
          throw err;
        }
        console.info("Environment creation successfully blocked");
      } else {
        // Unrecognized error. Rethrow.
        throw err;
      }
    }
  } finally {
    // Clean up after ourselves
    console.info("Unblocking tenant");
    await context.setFronteggTenantBlockedStatus(false);
  }
}

async function testPlatformEnvironment(
  page: Page,
  request: APIRequestContext,
  password: string
) {
  const testdbUser = process.env.PG_SOURCE_TEST_DB_USERNAME;
  const testdbPass = process.env.PG_SOURCE_TEST_DB_PASSWORD;
  const testdbDbName = process.env.PG_SOURCE_TEST_DB_DB_NAME;
  const testdbHost = process.env.PG_SOURCE_TEST_DB_HOST;
  const testdbPort = process.env.PG_SOURCE_TEST_DB_PORT;
  assert(testdbUser && testdbPass && testdbDbName && testdbHost && testdbPort);

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

  console.log("Creating source.");
  await client.query(`CREATE SECRET pgpass AS '${testdbPass}';`);
  await client.query(`
      CREATE CONNECTION pg_connection TO POSTGRES (
          HOST '${testdbHost}',
          PORT ${testdbPort},
          USER '${testdbUser}',
          PASSWORD SECRET pgpass,
          SSL MODE 'require',
          DATABASE '${testdbDbName}'
      );
    `);
  await client.query(
    `CREATE SOURCE mz_source IN CLUSTER default FROM POSTGRES CONNECTION pg_connection (PUBLICATION 'mz_source') FOR ALL TABLES;`
  );

  console.log("Waiting for source.");
  const { rowCount: replicatedTableCount } = await client.query(`
      SELECT a FROM t1;
    `);
  assert.equal(replicatedTableCount, 0);

  if (!IS_KIND) {
    await testEgress(
      client,
      page,
      testdbUser,
      testdbPass,
      testdbDbName,
      testdbHost,
      testdbPort
    );
  }

  console.log("Succeeded");
  return;
}

async function testEgress(
  client: Client,
  page: Page,
  user: string,
  pass: string,
  dbName: string,
  host: string,
  port: string
) {
  console.log("Connecting to source test db");
  const testdbClient = await connectPostgres(
    page,
    user,
    pass,
    dbName,
    host,
    port
  );
  console.log("Cleaning out old replication slots");
  const { rows: inactiveReplicationSlots } = await testdbClient.query(`
      SELECT slot_name FROM pg_replication_slots WHERE active = FALSE;
    `);
  for (const inactiveReplicationSlot of inactiveReplicationSlots) {
    await testdbClient.query(`
      SELECT pg_drop_replication_slot('${inactiveReplicationSlot.slot_name}');
    `);
  }

  const { rows: replicationSlots } = await client.query(`
      SELECT replication_slot FROM mz_internal.mz_postgres_sources;
    `);
  assert.equal(replicationSlots.length, 1);
  const replicationSlot = replicationSlots[0].replication_slot;
  console.log(`Using replication slot ${replicationSlot}`);

  const { rows: egressAddressRows } = await client.query(`
      SELECT egress_ip FROM mz_catalog.mz_egress_ips;
    `);
  const egressAddresses = egressAddressRows.map((row) => row.egress_ip);
  console.log("egressAddresses: [" + egressAddresses.join() + "]");
  assert(egressAddresses.length > 0);

  let clientAddresses = [];
  for (let i = 0; i < 30; i++) {
    const { rows: clientAddrRows } = await testdbClient.query(
      `SELECT client_addr FROM pg_stat_activity JOIN pg_replication_slots ON pg_replication_slots.active_pid = pg_stat_activity.pid WHERE slot_name = '${replicationSlot}';`
    );
    clientAddresses = clientAddrRows.map((row) => row.client_addr);
    console.log("clientAddresses: [" + clientAddresses.join() + "]");
    if (clientAddressesValid(clientAddresses, egressAddresses)) {
      break;
    }
    console.log("Couldn't find client_addr, retrying...");
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  // TODO: re-enable this assertion once we have an answer/fix on
  // <https://support.isovalent.com/hc/en-us/requests/332>:
  // assert(clientAddressesValid(clientAddresses, egressAddresses));
}

function clientAddressesValid(
  clientAddresses: string[],
  egressAddresses: string[]
): boolean {
  if (clientAddresses.length == 0) {
    return false;
  }
  for (const clientAddress of clientAddresses) {
    if (!egressAddresses.includes(clientAddress)) {
      return false;
    }
  }
  return true;
}

async function connectPostgres(
  page: Page,
  username: string,
  password: string,
  dbName: string,
  host: string,
  port: string
): Promise<Client> {
  const url = new URL(host.startsWith("http") ? host : `http://${host}`);
  const dns = new CacheableLookup({
    maxTtl: 0, // always re-lookup
    errorTtl: 0,
  });

  for (let i = 0; i < 60; i++) {
    try {
      const entry = await dns.lookupAsync(url.hostname);
      const pgParams = {
        user: username,
        host: entry.address,
        port: parseInt(port, 10),
        database: dbName,
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
}

async function connectRegionPostgres(
  page: Page,
  password: string
): Promise<Client> {
  await page.getByRole("button", { name: "External tools" }).click();
  const connectionInfo = await page.locator("pre").innerText();
  const lines = connectionInfo.split("\n").filter((line) => !!line);
  const hostAddress = lines.find((line) => line.startsWith("HOST="))?.slice(5);
  const port = lines.find((line) => line.startsWith("PORT="))?.slice(5);
  const database = lines.find((line) => line.startsWith("DATABASE="))?.slice(9);

  assert(hostAddress && port && database);

  return await connectPostgres(
    page,
    EMAIL,
    password,
    database,
    hostAddress,
    port
  );
}
