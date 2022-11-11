import type { GlobalConfig } from "../config";

const globalConfigStub: GlobalConfig = {
  fronteggUrl: "https://frontegg.com",
  segmentApiKey: "segment-api-key",
  sentryDsn: "https://sentry.io/sentry-key",
  sentryEnvironment: "sentry-environment",
  sentryRelease: "sentry-release",
  statuspageId: "statuspage-dummy-id",
  googleAnalyticsId: "google-analytics-id",
  environmentdScheme: "http",
  cloudRegions: new Map(),
  recoilDuplicateCheckingEnabled: false,
};

export default globalConfigStub;
