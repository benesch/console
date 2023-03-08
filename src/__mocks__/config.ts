import type { GlobalConfig } from "../config";

const globalConfigStub: GlobalConfig = {
  fronteggUrl: "https://frontegg.com",
  launchDarklyKey: "launchdarkly-dummy-key",
  segmentApiKey: "segment-api-key",
  sentryDsn: null,
  sentryEnvironment: "sentry-environment",
  sentryRelease: "sentry-release",
  statuspageId: "statuspage-dummy-id",
  environmentdScheme: "http",
  cloudRegions: new Map(),
  recoilDuplicateCheckingEnabled: false,
};

export const getCurrentStack = jest.fn(() => "test");
export const setCurrentStack = jest.fn();
export const getFronteggUrl = jest.fn();

export default globalConfigStub;
