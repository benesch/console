import { globalConfigStub } from "../__mocks__/config";
import { globalConfigNoAnalyticsSetup } from "./__mocks__";
import SegmentAnalyticsClient from "./segment";

const makeSegmentAnalyticsClient = (): SegmentAnalyticsClient => {
  return new SegmentAnalyticsClient(globalConfigStub);
};

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
    it("calling page should emit a segment event", () => {
      const client = makeSegmentAnalyticsClient();
      (client.segmentNativeClient?.page as jest.Mock).mockClear();
      client.page();
      expect(client.segmentNativeClient?.page).toHaveBeenCalledTimes(1);
    });

    it("calling identify should use segment native method", () => {
      const client = makeSegmentAnalyticsClient();
      client.identify("user-1");
      expect(client.segmentNativeClient?.identify).toHaveBeenCalledWith(
        "user-1"
      );
    });
    it("calling reset should use segment native method", () => {
      const client = makeSegmentAnalyticsClient();
      client.reset();
      expect(client.segmentNativeClient?.reset).toHaveBeenCalled();
    });
  });
});
