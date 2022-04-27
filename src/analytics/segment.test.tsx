import { globalConfigNoAnalyticsSetup } from "./__mocks__";
import SegmentAnalyticsClient from "./segment";

const makeSegmentAnalyticsClientWithNoApiKey = (): SegmentAnalyticsClient => {
  return new SegmentAnalyticsClient(globalConfigNoAnalyticsSetup);
};

jest.mock("@segment/analytics-next");

describe("analytics/segment", () => {
  describe("SegmentAnalyticsClient", () => {
    it("constructor should not attempt to build a segment client if the config is not present", () => {
      const client = makeSegmentAnalyticsClientWithNoApiKey();
      expect(client.segmentNativeClient).toBeNull();
    });
  });
});
