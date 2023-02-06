import type { GlobalConfig } from "../config";

const globalConfigStub: GlobalConfig = {
  fronteggUrl: "https://frontegg.com",
  launchDarklyKey: "launchdarkly-dummy-key",
  segmentApiKey: "segment-api-key",
  sentryDsn: null,
  sentryEnvironment: "sentry-environment",
  sentryRelease: "sentry-release",
  statuspageId: "statuspage-dummy-id",
  googleAnalyticsId: "google-analytics-id",
  environmentdScheme: "http",
  cloudRegions: new Map(),
  recoilDuplicateCheckingEnabled: false,
};

export default globalConfigStub;
