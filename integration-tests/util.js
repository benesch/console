module.exports = {};

module.exports.CONSOLE_ADDR =
  process.env.CONSOLE_ADDR || "http://localhost:8000";
module.exports.SCRATCH_DIR = "scratch";

module.exports.XPATH = {
  deployments_create: '//button[text()="Create deployment"]',
  deployments_destroy: '//td/button[contains(text(), "Destroy")]',
  deployments_connect: '//td/button[contains(text(), "Connect")]',
  deployments_upgrade: '//td/button[contains(text(), "Upgrade")]',
  deployments_ready: '//td[contains(text(), "Healthy")]',
  deployments_upgrading: '//td[contains(text(), "Upgrading")]',
  deployments_logs: '//button[text()="Logs"]',
};

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

async function loginToTestAccount() {
  console.log("Connecting to", module.exports.CONSOLE_ADDR);

  // Initial loading can take a while if the backend is spinning up.
  const response = await page.goto(module.exports.CONSOLE_ADDR, {
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
  await page.waitForXPath(module.exports.XPATH.deployments_create);
  expect(page.url()).toEndWith("/deployments");
}
module.exports.loginToTestAccount = loginToTestAccount;
