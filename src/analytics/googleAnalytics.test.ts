import ReactGA from "react-ga";

import { globalConfigStub } from "../__mocks__/config";
import { globalConfigNoAnalyticsSetup } from "./__mocks__";
import GAAnalyticsClient from "./googleAnalytics";

const makeGAClient = (): GAAnalyticsClient => {
  return new GAAnalyticsClient(globalConfigStub);
};

const makeGAClientWithNoApiKey = (): GAAnalyticsClient => {
  return new GAAnalyticsClient(globalConfigNoAnalyticsSetup);
};

jest.mock("react-ga", () => {
  return {
    initialize: jest.fn(),
    pageview: jest.fn(),
  };
});

describe("analytics/googleanalytics", () => {
  beforeEach(() => (ReactGA.initialize as jest.Mock).mockClear());
  describe("SegmentAnalyticsClient", () => {
    it("constructor should initialize React-GA client with the right id", () => {
      makeGAClient();
      // first argument of first call
      expect(ReactGA.initialize).toHaveBeenCalledWith(
        globalConfigStub.googleAnalyticsId
      );
    });
    it("constructor should not attempt to build a segment client if the config is not present", () => {
      makeGAClientWithNoApiKey();
      expect(ReactGA.initialize).not.toHaveBeenCalled();
    });
    it("calling page should trigger a GA event emission", () => {
      const client = makeGAClient();
      (ReactGA.pageview as jest.Mock).mockClear();
      client.page();
      expect(ReactGA.pageview).toHaveBeenCalledTimes(1);
    });
  });
});
