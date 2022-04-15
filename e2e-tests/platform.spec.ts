import { test } from "@playwright/test";

import { CONSOLE_ADDR, IS_MINIKUBE, STATE_NAME, TestContext } from "./util";
const provider = IS_MINIKUBE ? "local" : "AWS";
const region = IS_MINIKUBE ? "minikube" : "us-east-1";

test.afterEach(async ({ page }) => {
  // Update the refresh token for future tests.
  await page.context().storageState({ path: STATE_NAME });
});

test(`connecting to the environment controller`, async ({ page, request }) => {
  const context = await TestContext.start(page, request);
  const name = "Environment controller test token";
  const { password } = await context.fronteggRequest(
    "/identity/resources/tenants/api-tokens/v2",
    { data: { description: name } }
  );
  console.log("environment-controller password", password);

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
