import { GlobalConfig } from "../types";
import { AnalyticsClient } from "./types";

export const globalConfigStub: GlobalConfig = {
  fronteggUrl: "https://frontegg.com",
  segmentApiKey: "segment-api-key",
  sentryDsn: "https://sentry.io/sentry-key",
  sentryEnvironment: "sentry-environment",
  sentryRelease: "sentry-release",
  googleAnalyticsId: "google-analytics-id",
};

export const globalConfigNoAnalyticsSetup: GlobalConfig = {
  ...globalConfigStub,
  segmentApiKey: null,
  googleAnalyticsId: null,
};
