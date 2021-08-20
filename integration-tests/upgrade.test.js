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

const LEGACY_VERSION = "0.7.3";

function overrideDeploymentVersion(request) {
  console.log("page.on");
  var overrides = {};
  // Have to check what request we're handling,
  // since awaiting the button click doesn't wait
  // for the request to send.
  console.log(request.method(), request.url(), request.postData());
  if (
    request.method() == "POST" &&
    request.postData() &&
    request.url().endsWith("/api/deployments")
  ) {
    console.log(`overriding request to use v${LEGACY_VERSION}`);
    var postData = JSON.parse(request.postData());
    postData.mzVersion = `v${LEGACY_VERSION}`;
    overrides.postData = JSON.stringify(postData);
  }
  console.log("continuing request");
  request.continue(overrides);
}

test(
  "upgrade",
  async () => {
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
    console.log(`Creating deployment for v${LEGACY_VERSION}`);
    page.setRequestInterception(true);
    page.on("request", overrideDeploymentVersion);
    const create = await page.waitForXPath(XPATH.deployments_create);
    await create.click();
    // This might actually log before sending the create request.
    console.log("Waiting for deployment to be 'Healthy'");

    // TODO wait for response here instead?
    // Wait for it to be ready.
    const statusCell = await page.waitForXPath(XPATH.deployments_ready);
    page.removeListener("request", overrideDeploymentVersion);
    page.setRequestInterception(false);
    console.log("found statusCell");
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
    expect(query_version).toBe(LEGACY_VERSION);
    await client.end();

    // Upgrade
    console.log("Beginning upgrade");
    const upgradeButton = await page.waitForXPath(XPATH.deployments_upgrade);
    await upgradeButton.click();

    console.log("Entering confirmation text");
    await page.waitForSelector(".modal .content input").then((el) => {
      return el.type(deploymentName);
    });
    console.log("Clicking upgrade confirmation button");
    await page
      .waitForXPath(
        "//button[text()='Yes, upgrade and restart'][not(@disabled)]"
      )
      .then((el) => {
        return el.click();
      });
    console.log("Waiting for upgrade to begin");
    while (true) {
      let versionElement = await (await connectButton.$x("./../../td[3]"))[0];
      let version = await page.evaluate((el) => el.textContent, versionElement);
      let statusElement = await (await connectButton.$x("./../../td[2]"))[0];
      let statusString = await page.evaluate(
        (el) => el.textContent,
        statusElement
      );
      console.log(`Got version ${version} and status ${statusString}`);
      if (version != `v${LEGACY_VERSION}` && statusString.includes("Healthy")) {
        break;
      }
      // not updated yet, so wait and retry
      await page.waitForTimeout(1000);
    }
    console.log("Waiting for upgrade to complete");
    while (true) {
      let stateElement = await (await connectButton.$x("./../../td[2]"))[0];
      let state = await page.evaluate((el) => el.textContent, stateElement);
      console.log(`Got state ${state}`);
      if (state == "Healthy") {
        break;
      }
      // not updated yet, so wait and retry
      await page.waitForTimeout(1000);
    }

    // psql connect.
    console.log("psql connecting");
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
    const new_query_version = (
      await client.query("select version()")
    ).rows[0].version.match(/\(materialized (.*)\)/)[1];
    const new_table_version = await (
      await connectButton.$x("./../../td[3]")
    )[0].evaluate((el) => el.textContent.match(/v(.*)/)[1]);
    expect(new_query_version).toBe(new_table_version);
    expect(new_query_version).not.toBe(LEGACY_VERSION);
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
