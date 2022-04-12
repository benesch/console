import { test } from "@playwright/test";

import { CONSOLE_ADDR, IS_MINIKUBE, STATE_NAME, TestContext } from "./util";
const provider = IS_MINIKUBE ? "local" : "AWS";
const region = IS_MINIKUBE ? "minikube" : "us-east-1";

test.afterEach(async ({ page }) => {
  // Update the refresh token for future tests.
  await page.context().storageState({ path: STATE_NAME });
});

test(`creating and using an app password`, async ({ page, request }) => {
  const context = await TestContext.start(page, request);
  const name = "Integration test token";
  await context.deleteAllKeys();
  await page.goto(`${CONSOLE_ADDR}/access`);

  // Create key
  await page.waitForSelector("text=No app-specific passwords yet.");
  await page.fill("form [name=name]", name);
  await page.click("form button:text('Submit')");
  await page.waitForSelector(`text=New password "${name}"`);
  // TODO: test copy to clipboard button once playwright supports that
  const passwordField = await page.waitForSelector(
    `css=[aria-label="clientId"]`
  );
  const password = await passwordField.evaluate((e) => e.textContent);

  await page.goto(`${CONSOLE_ADDR}/deployments`);
  const deployment = await context.apiRequest("/deployments", {
    method: "POST",
    data: {
      cloudProviderRegion: {
        provider: provider,
        region: `${region}`,
      },
      skipMtlsAuth: true,
    },
  });
  await page.click(`text=${deployment.name}`);
  await context.waitForDeploymentHealthy();
  await page.waitForSelector("text=Generate an app-specific password");
  const version = await context.readDeploymentField("Version");
  await context.assertDeploymentMzVersion(version, password);

  // Delete key
  await page.goto(`${CONSOLE_ADDR}/access`);
  await page.click("[aria-label='Delete password']");
  await page.type("[aria-modal] input", name);
  await page.click("[aria-modal] button:text('Delete')");
  await page.waitForSelector("text=No app-specific passwords yet.");
});
