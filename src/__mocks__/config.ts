import { GlobalConfig } from "../types";

export const globalConfigStub: GlobalConfig = {
  fronteggUrl: "https://frontegg.com",
  segmentApiKey: "segment-api-key",
  sentryDsn: "https://sentry.io/sentry-key",
  sentryEnvironment: "sentry-environment",
  sentryRelease: "sentry-release",
  googleAnalyticsId: "google-analytics-id",
  releaseNotesRootURL: null,
  lastReleaseNoteId: null,
};

export const mockGlobalConfig = (overrides: Partial<GlobalConfig> = {}) => {
  window.CONFIG = {
    ...(window.CONFIG || {}),
    ...globalConfigStub,
    ...overrides,
  };
};
