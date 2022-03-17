import { expect, Page, test } from "@playwright/test";

import { IS_MINIKUBE, LEGACY_VERSION, TestContext } from "./util";

const provider = IS_MINIKUBE ? "local" : "AWS";
const regions = IS_MINIKUBE ? ["minikube"] : ["us-east-1", "eu-west-1"];

for (const region of regions) {
  test(`create deployment for region ${region}`, async ({ page, request }) => {
    const context = await TestContext.start(page, request);
    const latestVersion = await context.apiRequest("/mz-versions/latest");

    // Create deployment.
    await page.click("text=Create deployment");
    await page.fill("[aria-modal] [name=name]", "Integration test deployment");
    await page.selectOption(
      "[aria-modal] [name='cloudProviderRegion.region']",
      { label: `${region}` }
    );
    await page.click("[aria-modal] button:text('Create')");
    await page.click("text=Integration test deployment");

    // Verify deployment health and properties.
    await context.waitForDeploymentHealthy();
    await context.assertDeploymentMzVersion(latestVersion);
    await context.assertDeploymentSize("XS");

    // Verify that the deployment logs are visible.
    await page.click("text=View logs");
    const logs = await awaitLogs(page);
    expect(logs).toMatch(/materialized.*listening on 0.0.0.0:6875.../);
    page.click("[aria-label=Close]");

    // Update the deployment name and size.
    await page.click("text=Edit");
    await page.fill("[aria-modal] [name=name]", "New name");
    await page.selectOption("[aria-modal] [name=size]", { label: "Small" });
    await Promise.all([
      page.waitForSelector("[aria-modal]", { state: "detached" }),
      page.click("[aria-modal] button:text('Save')"),
    ]);
    // Verify that the deployment has been updated accordingly.
    await context.waitForDeploymentHealthy();
    await context.assertDeploymentSize("S");

    // Update the deployment index mode.
    await page.click("text=Edit");
    await page.click('[aria-modal] button:has-text("Advanced")');
    await page.click('[aria-modal] label:has-text("Disable user indexes")');
    await Promise.all([
      page.waitForSelector("[aria-modal]", { state: "detached" }),
      page.click("[aria-modal] button:text('Save')"),
    ]);
    await context.waitForDeploymentFieldValue(
      "Status",
      "User Indexes Disabled",
      {
        timeout: 600000 /* 10 minutes */,
      }
    );

    // Destroy the deployment.
    await page.click("text=Destroy");
    await page.type("[aria-modal] input", "New name");
    await page.click("[aria-modal] button:text('Destroy')");
    await page.waitForSelector("text=No deployments yet");
  });
}

for (const region of regions) {
  test(`upgrade deployment of ${region}`, async ({ page, request }) => {
    const context = await TestContext.start(page, request);
    const latestVersion = await context.apiRequest("/mz-versions/latest");

    // Use a raw API request to create a deployment running an old version.
    const deployment = await context.apiRequest("/deployments", {
      method: "POST",
      body: JSON.stringify({
        mzVersion: LEGACY_VERSION,
        cloudProviderRegion: {
          provider: provider,
          region: `${region}`,
        },
      }),
    });
    await page.click(`text=${deployment.name}`);

    // Verify deployment health and properties.
    await context.waitForDeploymentHealthy();
    await context.assertDeploymentMzVersion(LEGACY_VERSION);

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
