const fs = require("fs");
const path = require("path");
const extract = require("extract-zip");

const { Client } = require("pg");
const {
  CONSOLE_ADDR,
  SCRATCH_DIR,
  XPATH,
  LEGACY_VERSION,
  waitForXPathDoesNotExist,
  pollForSelector,
  destroyDeployment,
  testSetup,
} = require("./util");

testSetup();

test(
  "admin_requires_authentication",
  async () => {
    const response = await page.goto(CONSOLE_ADDR + "/admin", {
      timeout: 1000 * 60 * 5 /* 5 minutes */,
    });
    console.log("admin interface response status", response.status());
    expect(response.status()).toBe(200);

    if (
      CONSOLE_ADDR.startsWith("http://backend") ||
      !process.env.CONSOLE_ADDR
    ) {
      console.log(
        "Test appears to be running in the dev environment - terminating early with success."
      );
      return;
    }
    expect(page.url()).toMatch(
      new RegExp("^" + CONSOLE_ADDR + "/admin/login", "")
    );
  },
  // 10 minute timeout
  1000 * 60 * 10
);
