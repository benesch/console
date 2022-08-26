import { expect, test } from "@playwright/test";

import { CONSOLE_ADDR } from "./util";

test("admin requires authentication", async ({ page }) => {
  await page.goto(CONSOLE_ADDR + "/admin");

  if (
    CONSOLE_ADDR.startsWith("http://frontend") ||
    CONSOLE_ADDR.startsWith("http://localhost")
  ) {
    console.log(
      "Test appears to be running in the dev environment - terminating early with success."
    );
    return;
  }

  expect(page.url()).toMatch(new RegExp("^" + CONSOLE_ADDR + "/admin/login"));
});
