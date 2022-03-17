import { chromium } from "@playwright/test";

import { CONSOLE_ADDR, EMAIL, PASSWORD, STATE_NAME } from "./util";

export default async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(CONSOLE_ADDR);
  await page.type("[name=email]", EMAIL);
  await page.press("[name=email]", "Enter");
  await page.waitForSelector("[name=password]"); // wait for animation
  await page.type("[name=password]", PASSWORD);
  await Promise.all([
    page.waitForNavigation(),
    page.press("[name=password]", "Enter"),
  ]);
  await page.context().storageState({ path: STATE_NAME });
  await browser.close();
}
