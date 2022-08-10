import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  timeout: 900000, // 15 minutes
  use: {
    acceptDownloads: true,
    trace: "retain-on-failure",
  },
  workers: 3, // More workers than that might not be advisable on a kind cluster.
  fullyParallel: true,
};

export default config;
