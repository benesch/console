import { expect, Page, test } from "@playwright/test";

import { IS_KIND, LEGACY_VERSION, STATE_NAME, TestContext } from "./util";

const provider = IS_KIND ? "local" : "AWS";
const regions = IS_KIND ? ["kind"] : ["us-east-1", "eu-west-1"];

test.afterEach(async ({ page }) => {
  // Update the refresh token for future tests.
  await page.context().storageState({ path: STATE_NAME });
});

for (const region of regions) {
  test(`upgrade deployment in ${region}`, async ({ page, request }) => {
    const context = await TestContext.start(page, request);
    await page.click('a:has-text("Deployments")');
    const latestVersion = await context.apiRequest("/mz-versions/latest");

    // Use a raw API request to create a deployment running an old version.
    const deployment = await context.apiRequest("/deployments", {
      method: "POST",
      data: {
        mzVersion: LEGACY_VERSION,
        cloudProviderRegion: {
          provider: provider,
          region: `${region}`,
        },
      },
    });
    await page.click(`text=${deployment.name}`);

    // Verify deployment health and properties.
    await context.waitForDeploymentHealthy();
    await context.assertDeploymentMzVersion(LEGACY_VERSION);

    // Verify that the deployment logs are visible.
    await page.click("text=View logs");
    const logs = await awaitLogs(page);
    expect(logs).toMatch(/materialized.*listening on 0.0.0.0:6875.../);
    await page.click("[aria-label=Close]");

    // Put a table in it to ensure it's still there after the upgrade.
    const before_data = await context.withPostgres(async function (pgConn) {
      await pgConn.query("CREATE TABLE t (a int)");
      await pgConn.query("INSERT INTO t VALUES (1)");
      return pgConn.query("SELECT * FROM t");
    });
    expect(before_data.rows[0].a).toEqual(1);

    // Upgrade to the latest version of Materialize.
    await page.click("button:text('Upgrade')");
    await page.type("[aria-modal] input", deployment.name);
    await Promise.all([
      page.waitForSelector("[aria-modal]", { state: "detached" }),
      page.click("[aria-modal] button:text('Upgrade')"),
    ]);

    // Verify deployment health and properties again.
    await context.waitForDeploymentVersion(latestVersion);
    await context.waitForDeploymentHealthy();
    await context.assertDeploymentMzVersion(latestVersion);

    // Verify the table is still there.
    const after_data = await context.withPostgres(async function (pgConn) {
      await pgConn.query("INSERT INTO t VALUES (2)");
      return pgConn.query("SELECT * FROM t ORDER BY a");
    });
    // TODO after persistence exists, verify that the original value is there too.
    expect(after_data.rows[0].a).toEqual(2);

    // Delete the deployment.
    await context.deleteAllDeployments();
  });
}

async function awaitLogs(page: Page) {
  for (let i = 0; i < 10; i++) {
    try {
      const logs = await page.waitForSelector("[aria-modal] pre", {
        timeout: 1000,
      });
      return await logs.textContent();
    } catch (e) {
      page.click("[aria-modal] :text('Refresh')");
    }
  }
  throw new Error("unable to load logs");
}
