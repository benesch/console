import globalConfigStub from "~/__mocks__/config";
import { globalConfigNoAnalyticsSetup } from "~/analytics/__mocks__";
import { Buffer, default as SegmentAnalyticsClient } from "~/analytics/segment";

const makeSegmentAnalyticsClientWithNoApiKey = (): SegmentAnalyticsClient => {
  return new SegmentAnalyticsClient(globalConfigNoAnalyticsSetup);
};

jest.mock("@segment/analytics-next");

describe("analytics/segment", () => {
  describe("SegmentAnalyticsClient", () => {
    it("constructor should build a Buffer client if the config is not present", () => {
      const client = makeSegmentAnalyticsClientWithNoApiKey();
      expect(client.segmentNativeClient).toBeDefined();
      expect(client.segmentNativeClient).toHaveProperty("queue");
    });
    it("should export events to a client when one shows up", async () => {
      const fake = new Buffer();
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const analytics = require("@segment/analytics-next");
      analytics.AnalyticsBrowser.load.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([fake]), 400))
      );
      const client = new SegmentAnalyticsClient(globalConfigStub);
      client.page({ name: "/somewhere" });
      client.identify("456");
      await new Promise((resolve) => setTimeout(resolve, 500));
      expect(fake.queue).toHaveLength(2);
      expect(fake.queue[0][0]).toBe("page");
      expect(fake.queue[0][1].properties?.path).toBe("/");
    });
  });
});
