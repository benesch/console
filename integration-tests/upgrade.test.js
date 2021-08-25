const fs = require("fs");
const path = require("path");

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

async function requestAndConfirmUpgrade(deploymentName) {
  console.log("Beginning upgrade");
  const upgradeButton = await page.waitForXPath(XPATH.deployments_upgrade);
  await upgradeButton.click();

  console.log("Entering confirmation text");
  await page.waitForSelector(".modal .content input").then((el) => {
    return el.type(deploymentName);
  });
  console.log("Clicking upgrade confirmation button");
  await page
    .waitForXPath("//button[text()='Yes, upgrade and restart'][not(@disabled)]")
    .then((el) => {
      return el.click();
    });
  console.log("Waiting for upgrade to begin");
  const connectButton = await page.waitForXPath(XPATH.deployments_connect);

  const noActionTimeout = 10000; // after 10s, try hitting the upgrade button again.
  const deadline = Date.now() + noActionTimeout;
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
      return true;
    }
    if (
      version == `v${LEGACY_VERSION}` &&
      statusString.includes("Healthy") &&
      page.$x(XPATH.deployments_upgrade) &&
      Date.now() >= deadline
    ) {
      // We have been sitting at an unactioned deploy for 10s. Tell
      // our caller so that they may retry.
      return false;
    }
    // not updated yet, so wait and retry
    await page.waitForTimeout(1000);
  }
  return false;
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

    // Upgrade - sometimes the request doesn't make it to the backend, so retry it after a litle while.
    let didUpgrade = false;
    while (!didUpgrade) {
      didUpgrade = await requestAndConfirmUpgrade(deploymentName);
      console.log("Upgrade request success:", didUpgrade);
    }
    const connectButton = await page.waitForXPath(XPATH.deployments_connect);
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

    const client = await connectPostgresql();
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
