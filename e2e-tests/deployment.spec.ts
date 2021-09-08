import { expect, Page, test } from "@playwright/test";

import { LEGACY_VERSION, TestContext } from "./util";

test("create deployment", async ({ page }) => {
  const context = await TestContext.start(page);
  const latestVersion = await context.apiRequest("/mz-versions/latest");

  // Create deployment.
  await page.click("text=Create deployment");
  await page.fill("[aria-modal] [name=name]", "Integration test deployment");
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
  await page.click("text=Update");
  await page.fill("[aria-modal] [name=name]", "New name");
  await page.selectOption("[aria-modal] [name=size]", { label: "Small" });
  await Promise.all([
    page.waitForSelector("[aria-modal]", { state: "detached" }),
    page.click("[aria-modal] button:text('Update')"),
  ]);

  // Verify that the deployment has been updated accordingly.
  await context.waitForDeploymentHealthy();
  await context.assertDeploymentMzVersion(latestVersion);
  await context.assertDeploymentSize("S");

  // Destroy the deployment.
  await page.click("text=Destroy");
  await page.type("[aria-modal] input", "New name");
  await page.click("[aria-modal] button:text('Destroy')");
  await page.waitForSelector("text=No deployments yet");
});

test("upgrade deployment", async ({ page }) => {
  const context = await TestContext.start(page);
  const latestVersion = await context.apiRequest("/mz-versions/latest");

  // Use a raw API request to create a deployment running an old version.
  const deployment = await context.apiRequest("/deployments", {
    method: "POST",
    body: JSON.stringify({ mzVersion: LEGACY_VERSION }),
  });
  await page.click(`text=${deployment.name}`);

  // Verify deployment health and properties.
  await context.waitForDeploymentHealthy();
  await context.assertDeploymentMzVersion(LEGACY_VERSION);

  // Upgrade to the latest version of Materialize.
  await page.click("text=Upgrade");
  await page.type("[aria-modal] input", deployment.name);
  await Promise.all([
    page.waitForSelector("[aria-modal]", { state: "detached" }),
    page.click("[aria-modal] button:text('Upgrade')"),
  ]);

  // Verify deployment health and properties again.
  await context.waitForDeploymentVersion(latestVersion);
  await context.waitForDeploymentHealthy();
  await context.assertDeploymentMzVersion(latestVersion);

  // Delete the deployment.
  await context.deleteAllDeployments();
});

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
