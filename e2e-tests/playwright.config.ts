import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  globalSetup: "./global-setup",
  timeout: 900000, // 15 minutes
  use: {
    acceptDownloads: true,
    launchOptions: {
      slowMo: 50,
    },
    storageState: "state.json",
    trace: "retain-on-failure",
  },
  workers: 1,
};

export default config;
