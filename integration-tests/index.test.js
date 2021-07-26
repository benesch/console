const fs = require("fs");
const path = require("path");
const extract = require("extract-zip");

const { Client } = require("pg");

const CONSOLE_ADDR = process.env.CONSOLE_ADDR || "http://localhost:8000";
const SCRATCH_DIR = "scratch";

const XPATH_DEPLOYMENTS_CREATE = '//button[text()="Create deployment"]';
const XPATH_DEPLOYMENTS_DESTROY = '//td/button[contains(text(), "Destroy")]';
const XPATH_DEPLOYMENTS_CONNECT = '//td/button[contains(text(), "Connect")]';
const XPATH_DEPLOYMENTS_UPGRADE = '//td/button[contains(text(), "Upgrade")]';
const XPATH_DEPLOYMENTS_READY = '//td[contains(text(), "Healthy")]';
const XPATH_DEPLOYMENTS_UPGRADING = '//td[contains(text(), "Upgrading")]';
const XPATH_DEPLOYMENTS_LOGS = '//button[text()="Logs"]';

const LEGACY_VERSION = "0.7.3";

console.log("CONSOLE_ADDR", CONSOLE_ADDR);

beforeEach(async () => {
  // 5 minute timeout waiting for elements.
  page.setDefaultTimeout(1000 * 60 * 5);
});

test(
  "console",
  async () => {
    fs.rmSync(SCRATCH_DIR, { recursive: true, force: true });
    fs.mkdirSync(SCRATCH_DIR, { recursive: true });

    // Initial loading can take a while if the backend is spinning up.
    const response = await page.goto(CONSOLE_ADDR, { timeout: 1000 * 60 * 5 /* 5 minutes */ });
    console.log("response status", response.status());
    expect(response.status()).toBe(200);

    expect(page.url()).toEndWith("/login");
    await page.waitForSelector("#login-form-email").then((el) => {
      return el.type("matt@materialize.io");
    });
    await page.waitForSelector("#login-form-password").then((el) => {
      return el.type("aoeuhtns");
    });
    await page.waitForXPath("//button[text()='Log in']").then((el) => {
      return el.click();
    });

    // Wait for the deployments page to load.
    const create = await page.waitForXPath(XPATH_DEPLOYMENTS_CREATE);
    expect(page.url()).toEndWith("/deployments");

    // Delete any existing deployments.
    const destroyButtons = await page.$x(XPATH_DEPLOYMENTS_DESTROY);
    for (const destroyButton of destroyButtons) {
      await destroyDeployment(page, destroyButton);
    }

    // Verify there's no Destroy buttons or Ready columns.
    await waitForXPathDoesNotExist(page, XPATH_DEPLOYMENTS_DESTROY);
    expect(await page.$x(XPATH_DEPLOYMENTS_DESTROY)).toBeEmpty();
    expect(await page.$x(XPATH_DEPLOYMENTS_READY)).toBeEmpty();

    // Create a deployment.
    await create.click();
    console.log("creating deployment");

    // Wait for it to be ready.
    const statusCell = await page.waitForXPath(XPATH_DEPLOYMENTS_READY);
    const deploymentName = await (await statusCell.$x("../td[1]"))[0].evaluate(
      (e) => e.textContent
    );
    console.log("got deployment", deploymentName);

    // Download certs and connection string.
    console.log("download certs");
    const connectButton = await page.waitForXPath(XPATH_DEPLOYMENTS_CONNECT);
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
    const logButton = (await page.$x(XPATH_DEPLOYMENTS_LOGS))[0];
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
    const destroyButton = (await page.$x(XPATH_DEPLOYMENTS_DESTROY))[0];
    await destroyDeployment(page, destroyButton);
  },
  // 10 minute timeout for the entire test.
  1000 * 60 * 10
);

function overrideDeploymentVersion(request) {
    console.log("page.on");
    var overrides = {};
    // Have to check what request we're handling,
    // since awaiting the button click doesn't wait
    // for the request to send.
    console.log(request.postData());
    if (request.postData()) {
        var postData = JSON.parse(request.postData());
        console.log(postData.operationName)
        if (postData.operationName == "CreateDeployment") {
            console.log(`overriding request to use v${LEGACY_VERSION}`);
            postData.variables.mzVersion = `v${LEGACY_VERSION}`;
            postData.query = `mutation CreateDeployment($tlsAuthorityId: UUID!, $mzVersion: String!) {
                createDeployment(tlsAuthorityId: $tlsAuthorityId, mzVersion: $mzVersion) {
                    deployment {
                        id
                        __typename
                    }
                    __typename
                }
            }`;

            overrides.postData = JSON.stringify(postData);
        }
    }
    console.log("continuing request");
    request.continue(overrides);
}

test(
  "upgrade",
  async () => {
    fs.rmSync(SCRATCH_DIR, { recursive: true, force: true });
    fs.mkdirSync(SCRATCH_DIR, { recursive: true });

    // Initial loading can take a while if the backend is spinning up.
    const response = await page.goto(CONSOLE_ADDR, { timeout: 1000 * 60 * 5 /* 5 minutes */ });
    console.log("response status", response.status());
    expect(response.status()).toBe(200);

    // We are already logged in from the previous test.
    // Wait for the deployments page to load.
    const create = await page.waitForXPath(XPATH_DEPLOYMENTS_CREATE);
    expect(page.url()).toEndWith("/deployments");

    // Delete any existing deployments.
    const destroyButtons = await page.$x(XPATH_DEPLOYMENTS_DESTROY);
    for (const destroyButton of destroyButtons) {
      await destroyDeployment(page, destroyButton);
    }

    // Verify there's no Destroy buttons or Ready columns.
    await waitForXPathDoesNotExist(page, XPATH_DEPLOYMENTS_DESTROY);
    expect(await page.$x(XPATH_DEPLOYMENTS_DESTROY)).toBeEmpty();
    expect(await page.$x(XPATH_DEPLOYMENTS_READY)).toBeEmpty();

    // Create a deployment.
    const LEGACY_VERSION = "0.7.3";
    console.log(`Creating deployment for v${LEGACY_VERSION}`);
    page.setRequestInterception(true);
    page.on('request', overrideDeploymentVersion);
    await create.click();
    // This might actually log before sending the create request.
    console.log("Waiting for deployment to be 'Healthy'");

    // TODO wait for response here instead?
    // Wait for it to be ready.
    const statusCell = await page.waitForXPath(XPATH_DEPLOYMENTS_READY);
    page.removeListener('request', overrideDeploymentVersion)
    page.setRequestInterception(false);
    console.log("found statusCell");
    const deploymentName = await (await statusCell.$x("../td[1]"))[0].evaluate(
      (e) => e.textContent
    );
    console.log("got deployment", deploymentName);

    // Download certs and connection string.
    console.log("download certs");
    const connectButton = await page.waitForXPath(XPATH_DEPLOYMENTS_CONNECT);
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
    const upgradeButton = await page.waitForXPath(XPATH_DEPLOYMENTS_UPGRADE);
    await upgradeButton.click();

    console.log("Entering confirmation text");
    await page.waitForSelector(".modal .content input").then((el) => {
        return el.type(deploymentName);
    });
    console.log("Clicking upgrade confirmation button");
    await page.waitForXPath("//button[text()='Yes, upgrade and restart'][not(@disabled)]").then((el) => {
      return el.click();
    });
    console.log("Waiting for upgrade to begin");
    while (true) {
        let versionElement = await (await connectButton.$x("./../../td[3]"))[0];
        let version = await page.evaluate(el => el.textContent, versionElement);
        console.log(`Got version ${version}`);
        if (version != `v${LEGACY_VERSION}`) {
            break
        }
        // not updated yet, so wait and retry
        await page.waitForTimeout(1000);
    }
    console.log("Waiting for upgrade to complete");
    while (true) {
        let stateElement = await (await connectButton.$x("./../../td[2]"))[0];
        let state = await page.evaluate(el => el.textContent, stateElement);
        console.log(`Got state ${state}`);
        if (state == "Healthy") {
            break
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
    const logButton = (await page.$x(XPATH_DEPLOYMENTS_LOGS))[0];
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
    const destroyButton = (await page.$x(XPATH_DEPLOYMENTS_DESTROY))[0];
    await destroyDeployment(page, destroyButton);
  },
  // 10 minute timeout for the entire test.
  1000 * 60 * 10
);

test(
  "admin_requires_authentication",
  async () => {
    const response = await page.goto(CONSOLE_ADDR + "/admin", { timeout: 1000 * 60 * 5 /* 5 minutes */ });
    console.log("admin interface response status", response.status());
    expect(response.status()).toBe(200);

    if(CONSOLE_ADDR.startsWith("http://backend") || !process.env.CONSOLE_ADDR) {
      console.log("Test appears to be running in the dev environment - terminating early with success.")
      return;
    }
    expect(page.url()).toMatch(new RegExp("^" + CONSOLE_ADDR + "/admin/login", ""));
  },
  // 10 minute timeout
  1000 * 60 * 10
);

// returns a Promise that resolves when xpathSelector no longer exists on the
// page.
function waitForXPathDoesNotExist(page, xpathSelector) {
  // The inner function is evaluated in the browser context, so we need to pass
  // the selector to it. Do some document.evaluate stuff so we get the results
  // back with a known length.
  return page.waitForFunction(
    (selector) => {
      return (
        document.evaluate(
          selector,
          document,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE
        ).snapshotLength === 0
      );
    },
    {},
    xpathSelector
  );
}

// returns a Promise that resolves when a deployment has been
// destroyed. destroyButton must be an ElementHandle of a Destroy button.
async function destroyDeployment(page, destroyButton) {
  // TODO: care about the button being in the enabled state, since it's disabled
  // during creation.

  await destroyButton.click();
  // Look for the destroy modal's confirm text by finding the first td two
  // parents up (the Name column).
  const confirmTextEl = (await destroyButton.$x("./../../td[1]"))[0];
  const confirmText = await confirmTextEl.evaluate((el) => el.textContent);
  console.log("destroying " + confirmText);
  // Enter the confirm text.
  await page.waitForSelector(".modal .content input").then((el) => {
    return el.type(confirmText);
  });
  // Click destroy.
  await page
    .waitForXPath(
      "//button[text()='Yes, destroy my deployment'][not(@disabled)]"
    )
    .then((el) => {
      return el.click();
    });
  // Wait for it to be destroyed.
  await waitForXPathDoesNotExist(
    page,
    `//td[contains(text(), "${confirmText}")]`
  );
}
