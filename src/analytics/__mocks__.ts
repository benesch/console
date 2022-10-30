import { globalConfigStub } from "../__mocks__/config";
import { GlobalConfig } from "../config";

// eslint-disable-next-line import/prefer-default-export
export const globalConfigNoAnalyticsSetup: GlobalConfig = {
  ...globalConfigStub,
  segmentApiKey: null,
  googleAnalyticsId: null,
  cloudRegions: new Map(),
};
