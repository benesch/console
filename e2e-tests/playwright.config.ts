import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  // Per test timeout
  timeout: 30 * 1000, // 30 seconds
  use: {
    acceptDownloads: true,
    // Actions such as clicks, also waitForSelector calls
    actionTimeout: 5 * 1000, // 3 seconds
    trace: "on",
  },
  workers: 5,
  fullyParallel: true,
};

export default config;
