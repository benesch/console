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

    // Download certs and connection string.
    console.log("download certs");
    const connectButton = await page.waitForXPath(XPATH.deployments_connect);
    await connectButton.click();
    const psql = await page
      .waitForSelector(".connection-string")
      .then((el) => el.evaluate((el) => el.textContent));
    console.log(psql);
    const matches = psql.match(
      /psql "postgresql:\/\/(.*)@(.*):(.*)\/(.*)\?ssl.*"/
    );
    await page
      .waitForXPath('//button[text()="Download certificates"]')
      .then((el) => {
        return el.click();
      });
    console.log("downloading certs");
    // Puppeteer only has hacky support for downloads.
    // https://github.com/puppeteer/puppeteer/issues/299
    await page._client.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: SCRATCH_DIR,
    });
    await page.waitForXPath('//button[text()="Done"]').then((el) => {
      return el.click();
    });
    const certZip = path.join(SCRATCH_DIR, `${deploymentName}-certs.zip`);
    // Wait until we can see the download.
    while (true) {
      try {
        fs.accessSync(certZip);
        // Can see.
        break;
      } catch {
        // Does not exist, wait and retry.
        await page.waitForTimeout(50);
      }
    }
    await extract(certZip, { dir: path.resolve(SCRATCH_DIR) });

    // psql connect.
    const client_params = {
      user: matches[1],
      host: matches[2],
      port: matches[3],
      database: matches[4],
      ssl: {
        ca: fs.readFileSync(path.join(SCRATCH_DIR, "ca.crt"), "utf8"),
        key: fs.readFileSync(path.join(SCRATCH_DIR, "materialize.key"), "utf8"),
        cert: fs.readFileSync(
          path.join(SCRATCH_DIR, "materialize.crt"),
          "utf8"
        ),
        rejectUnauthorized: false,
      },
      connectionTimeoutMillis: 1000,
      query_timeout: 1000,
    };
    console.log("connecting");
    let client;
    while (true) {
      try {
        client = new Client(client_params);
        await client.connect();
        break;
      } catch (error) {
        console.log(error);
        await page.waitForTimeout(1000);
      }
    }
    console.log("querying version");
    const query_version = (
      await client.query("select version()")
    ).rows[0].version.match(/\(materialized (.*)\)/)[1];
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
