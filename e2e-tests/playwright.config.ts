import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  globalSetup: "./global-setup",
  timeout: 300000, // 5 minutes
  use: {
    acceptDownloads: true,
    storageState: "state.json",
    trace: "retain-on-failure",
  },
  workers: 1,
};

export default config;
