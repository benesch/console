const fs = require("fs");
const path = require("path");
const extract = require("extract-zip");

const { Client } = require("pg");
const {
  CONSOLE_ADDR,
  SCRATCH_DIR,
  XPATH,
  waitForXPathDoesNotExist,
  pollForSelector,
  destroyDeployment,
  testSetup,
  loginToTestAccount,
  connectPostgresql,
} = require("./util");

testSetup();

test(
  "console",
  async () => {
    fs.rmSync(SCRATCH_DIR, { recursive: true, force: true });
    fs.mkdirSync(SCRATCH_DIR, { recursive: true });

    await loginToTestAccount();

    // Delete any existing deployments.
    const destroyButtons = await page.$x(XPATH.deployments_destroy);
    for (const destroyButton of destroyButtons) {
      await destroyDeployment(page, destroyButton);
    }

    // Verify there's no Destroy buttons or Ready columns.
    await waitForXPathDoesNotExist(page, XPATH.deployments_destroy);
    expect(await page.$x(XPATH.deployments_destroy)).toBeEmpty();
    expect(await page.$x(XPATH.deployments_ready)).toBeEmpty();

    // Create a deployment.
    const create = await page.waitForXPath(
      XPATH.deployments_create
    );
    await create.click();
    console.log("creating deployment");

    // Wait for it to be ready.
    const statusCell = await page.waitForXPath(XPATH.deployments_ready);
    const deploymentName = await (
      await statusCell.$x("../td[1]")
    )[0].evaluate((e) => e.textContent);
    console.log("got deployment", deploymentName);

    const client = await connectPostgresql();
    console.log("querying version");
    const query_version = (
      await client.query("select version()")
    ).rows[0].version.match(/\(materialized (.*)\)/)[1];
    const connectButton = await page.waitForXPath(XPATH.deployments_connect);
    const table_version = await (
      await connectButton.$x("./../../td[3]")
    )[0].evaluate((el) => el.textContent.match(/v(.*)/)[1]);
    expect(query_version).toBe(table_version);
    await client.end();

    // View logs for the deployment
    const logButton = (await page.$x(XPATH.deployments_logs))[0];
    await logButton.click();
    const logLines = await page
      .waitForSelector(".logs")
      .then((el) => el.evaluate((el) => el.textContent));
    console.log("materialized log", logLines);
    expect(logLines).not.toBeEmpty();
    await page.waitForXPath('//button[text()="Done"]').then((el) => {
      return el.click();
    });

    // Destroy it.
    const destroyButton = (await page.$x(XPATH.deployments_destroy))[0];
    await destroyDeployment(page, destroyButton);
  },
  // 10 minute timeout for the entire test.
  1000 * 60 * 10
);
