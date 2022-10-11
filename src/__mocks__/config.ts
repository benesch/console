import type { GlobalConfig } from "../config";
import * as configModule from "../config";

const mockConfig = configModule as { default: GlobalConfig };

export const globalConfigStub: GlobalConfig = {
  fronteggUrl: "https://frontegg.com",
  segmentApiKey: "segment-api-key",
  sentryDsn: "https://sentry.io/sentry-key",
  sentryEnvironment: "sentry-environment",
  sentryRelease: "sentry-release",
  statuspageId: "statuspage-dummy-id",
  googleAnalyticsId: "google-analytics-id",
  releaseNotesRootURL: null,
  lastReleaseNoteId: null,
  isDevelopment: false,
  environmentdScheme: "auto",
};

export const mockGlobalConfig = (overrides: Partial<GlobalConfig> = {}) => {
  jest.mock("./config", () => ({
    __esModule: true,
    default: null,
  }));
  mockConfig.default = {
    ...((configModule as any).config as GlobalConfig),
    ...globalConfigStub,
    ...overrides,
  };
};
