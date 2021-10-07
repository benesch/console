import { globalConfigNoAnalyticsSetup, globalConfigStub } from "./__mocks__";
import { SegmentAnalyticsClient } from "./segment";

const makeSegmentAnalyticsClient = (): SegmentAnalyticsClient => {
  return new SegmentAnalyticsClient(globalConfigStub);
};

const makeSegmentAnalyticsClientWithNoApiKey = (): SegmentAnalyticsClient => {
  return new SegmentAnalyticsClient(globalConfigNoAnalyticsSetup);
};

jest.mock("@segment/analytics.js-integration-segmentio", () => ({}));
jest.mock("@segment/analytics.js-core/build/analytics", () => {
  class AnalyticsMock {
    initialize = jest.fn();
    use = jest.fn();
    page = jest.fn();
  }
  return AnalyticsMock;
});

describe("analytics/segment", () => {
  describe("SegmentAnalyticsClient", () => {
    it("constructor should build a native segment client object and configure it", () => {
      const client = makeSegmentAnalyticsClient();
      expect(client.segmentNativeClient).toBeDefined();

      // first argument of first call
      expect(
        (client.segmentNativeClient?.initialize as jest.Mock).mock.calls[0][0]
      ).toMatchObject({
        "Segment.io": {
          apiKey: globalConfigStub.segmentApiKey,
        },
      });
      expect(client.segmentNativeClient?.use).toHaveBeenCalledWith({});
      // we send an analytics event at least once:
      expect(client.segmentNativeClient?.page).toHaveBeenCalledTimes(1);
    });
    it("constructor should not attempt to build a segment client if the config is not present", () => {
      const client = makeSegmentAnalyticsClientWithNoApiKey();
      expect(client.segmentNativeClient).toBeNull();
    });
    it("calling page should trigger a segment event emission", () => {
      const client = makeSegmentAnalyticsClient();
      (client.segmentNativeClient?.page as jest.Mock).mockReset();
      client.page();
      expect(client.segmentNativeClient?.page).toHaveBeenCalledTimes(1);
    });
  });
});
