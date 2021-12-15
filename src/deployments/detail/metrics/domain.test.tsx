import { mockDate } from "../../../__mocks__/date";
import { xDomainFromMetrics, yDomainFromMetrics } from "./domains";
import { VictoryMetric } from "./types";

const roundToTwoDecimals = (value: number) => Math.round(value * 100) / 100;

describe("domains", () => {
  const earliestTime = new Date(2020, 1, 1);
  const metrics: VictoryMetric[] = [
    { name: "metric1", values: [{ x: earliestTime, y: 1 }] },
  ];

  const fakeNow = new Date(2021, 1, 1);
  mockDate(fakeNow);
  describe("xDomainFromMetrics", () => {
    it("should return the earliest time from the metrics and now", () => {
      return expect(xDomainFromMetrics(metrics)).toEqual([
        earliestTime,
        fakeNow,
      ]);
    });
  });

  describe("yDomainFromMetrics", () => {
    describe("min y ", () => {
      it("should return 0", () => {
        const metricsWith: VictoryMetric[] = [
          { name: "metric1", values: [{ x: new Date(2020, 1, 1), y: 0.1 }] },
          { name: "metric1", values: [{ x: new Date(2020, 1, 1), y: 0.2 }] },
        ];

        expect(roundToTwoDecimals(yDomainFromMetrics(metricsWith)[0])).toEqual(
          0
        );
      });
    });
    describe("max y", () => {
      it("should be at least 1 (100%)", () => {
        const metricsWith: VictoryMetric[] = [
          { name: "metric1", values: [{ x: new Date(2020, 1, 1), y: 0.7 }] },
          { name: "metric1", values: [{ x: new Date(2020, 1, 1), y: 0.6 }] },
        ];
        expect(roundToTwoDecimals(yDomainFromMetrics(metricsWith)[1])).toEqual(
          1
        );
      });
      it("should return the max y + 10% buffer if the maximum is greater than 1 ", () => {
        const metricsWith: VictoryMetric[] = [
          { name: "metric1", values: [{ x: new Date(2020, 1, 1), y: 1.2 }] },
          { name: "metric1", values: [{ x: new Date(2020, 1, 1), y: 0.6 }] },
        ];

        expect(roundToTwoDecimals(yDomainFromMetrics(metricsWith)[1])).toEqual(
          1.2
        );
      });
    });
  });
});
