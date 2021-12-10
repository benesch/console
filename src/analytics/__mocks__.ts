import { globalConfigStub } from "../__mocks__/config";
import { GlobalConfig } from "../types";

export const globalConfigNoAnalyticsSetup: GlobalConfig = {
  ...globalConfigStub,
  segmentApiKey: null,
  googleAnalyticsId: null,
};
