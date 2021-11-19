import { chromium } from "@playwright/test";

import { CONSOLE_ADDR, EMAIL, PASSWORD } from "./util";

export default async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(CONSOLE_ADDR);
  await page.type("[name=email]", EMAIL);
  page.click("text=Continue");
  await page.waitForSelector("[name=password]"); // wait for animation
  await page.type("[name=password]", PASSWORD);
  page.click("text=Login");
  await Promise.all([page.waitForNavigation()]);
  await page.context().storageState({ path: "state.json" });
  await browser.close();
}
