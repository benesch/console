const fs = require("fs");
const path = require("path");
const extract = require("extract-zip");
const { Client } = require("pg");

module.exports = {};

const CONSOLE_ADDR = process.env.CONSOLE_ADDR || "http://localhost:8000";
module.exports.CONSOLE_ADDR = CONSOLE_ADDR;
const SCRATCH_DIR = "scratch";
module.exports.SCRATCH_DIR = SCRATCH_DIR;

const XPATH = {
  deployments_create: '//button[text()="Create deployment"]',
  deployments_destroy: '//td/button[contains(text(), "Destroy")]',
  deployments_connect: '//td/button[contains(text(), "Connect")]',
  deployments_upgrade: '//td/button[contains(text(), "Upgrade")]',
  deployments_ready: '//td[contains(text(), "Healthy")]',
  deployments_upgrading: '//td[contains(text(), "Upgrading")]',
  deployments_logs: '//button[text()="Logs"]',
};
module.exports.XPATH = XPATH;

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
module.exports.waitForXPathDoesNotExist = waitForXPathDoesNotExist;

/// Polls for a selector to exist. This is typically handled by
/// `page.waitForSelector`, but that function doesn't work for elements in
/// a shadow DOM, while the naive polling approach works fine.
async function pollForSelector(page, selector) {
  for (let i = 0; i < 30; i++) {
    if (await page.$(selector)) {
      return selector;
    }
    await page.waitForTimeout(200);
  }
  throw new Error(`timed out waiting for ${selector}`);
}

module.exports.pollForSelector = pollForSelector;

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
module.exports.destroyDeployment = destroyDeployment;

function testSetup() {
  beforeEach(async () => {
    // 5 minute timeout waiting for elements.
    page.setDefaultTimeout(1000 * 60 * 5);
  });
}
module.exports.testSetup = testSetup;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
module.exports.sleep = sleep;

async function loginToTestAccount() {
  console.log("Connecting to", CONSOLE_ADDR);

  // Initial loading can take a while if the backend is spinning up.
  const response = await page.goto(CONSOLE_ADDR, {
    timeout: 1000 * 60 * 5 /* 5 minutes */,
    waitUntil: "domcontentloaded",
  });
  console.log("response status", response.status());
  expect(response.status()).toBe(200);

  console.log("page url", page.url());

  const found = await Promise.race([
    pollForSelector(page, "pierce/[name=email]"), // login form
    pollForSelector(page, "table#deployments"), // already logged in
  ]);
  if (found == "table#deployments") {
    // We're logged in, short-circuit:
    return;
  }

  await page.$("pierce/[name=email]").then((el) => {
    return el.type("infra+cloud-integration-tests@materialize.com\r");
  });

  // TODO(benesch): no idea why this timeout is necessary, but otherwise the
  // following code types into the email box instead of the password box.
  await page.waitForTimeout(500);

  await page.$("pierce/[name=password]").then((el) => {
    // TODO(benesch): avoid hardcoding this password in the repository.
    // There's nothing sensitive in the account, though, so the worst that
    // could happen if leaked is that someone could spin up a bunch of
    // deployments in this account.
    return el.type("4PbT*fgq2fLNkNLLq3vnqqvj");
  });
  await page.$("pierce/[data-testid=submit-btn]").then((el) => {
    return el.click();
  });

  // Wait for the deployments page to load.
  await page.waitForXPath(XPATH.deployments_create);
  expect(page.url()).toEndWith("/deployments");
}
module.exports.loginToTestAccount = loginToTestAccount;

async function connectPostgresql() {
  const statusCell = await page.waitForXPath(XPATH.deployments_ready);
  const deploymentName = await (
    await statusCell.$x("../td[1]")
  )[0].evaluate((e) => e.textContent);
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
  console.log("download started for", certZip);
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

  const client_params = {
    user: matches[1],
    host: matches[2],
    port: matches[3],
    database: matches[4],
    ssl: {
      ca: fs.readFileSync(path.join(SCRATCH_DIR, "ca.crt"), "utf8"),
      key: fs.readFileSync(path.join(SCRATCH_DIR, "materialize.key"), "utf8"),
      cert: fs.readFileSync(path.join(SCRATCH_DIR, "materialize.crt"), "utf8"),
      rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 1000,
    query_timeout: 1000,
  };

  // wait 10s before we try to connect to the DB, so that the DNS
  // record has a chance of being created before we query it
  // initially. Theoretically, the negative 1s TTL we set on the SOA
  // should protect us from that, but historically there has been a
  // 60s delay before we could resolve the hostnames if timings
  // happened to work out badly.
  console.log("Waiting for the DNS record to appear");
  await sleep(10000);
  console.log("Connecting with the PostgreSQL client");
  while (true) {
    try {
      const client = new Client(client_params);
      await client.connect();
      return client;
    } catch (error) {
      console.log(error);
      await page.waitForTimeout(500);
    }
  }
}
module.exports.connectPostgresql = connectPostgresql;
