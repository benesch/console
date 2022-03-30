import { test } from "@playwright/test";

import { CONSOLE_ADDR, STATE_NAME, TestContext } from "./util";

test.afterEach(async ({ page }) => {
  // Update the refresh token for future tests.
  await page.context().storageState({ path: STATE_NAME });
});

test(`new app password`, async ({ page, request }) => {
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

  // TODO: use key

  // Delete key
  await page.click("[aria-label='Delete password']");
  await page.type("[aria-modal] input", name);
  await page.click("[aria-modal] button:text('Delete')");
  await page.waitForSelector("text=No app-specific passwords yet.");
});
