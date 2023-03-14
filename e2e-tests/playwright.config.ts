import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  timeout: 15 * 60 * 1000, // 15 minutes
  use: {
    acceptDownloads: true,
    actionTimeout: 3 * 1000, // 3 seconds
    trace: "retain-on-failure",
  },
  workers: 5,
  fullyParallel: true,
};

export default config;
