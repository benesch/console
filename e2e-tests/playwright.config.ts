import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  globalSetup: "./global-setup",
  timeout: 900000, // 15 minutes
  use: {
    acceptDownloads: true,
    trace: "retain-on-failure",
  },
  workers: 5,
  fullyParallel: true,
};

export default config;
