import { mockDate } from "../../../__mocks__/date";
import { xDomainFromMetrics, yDomainFromMetrics } from "./domains";
import { VictoryMetric } from "./types";

const roundToOneDecimal = (value: number) => Math.round(value * 10) / 10;

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
      it("should return 0 if the mininum y is under 0.2", () => {
        const metricsWith: VictoryMetric[] = [
          { name: "metric1", values: [{ x: new Date(2020, 1, 1), y: 0.1 }] },
          { name: "metric1", values: [{ x: new Date(2020, 1, 1), y: 0.2 }] },
        ];

        expect(roundToOneDecimal(yDomainFromMetrics(metricsWith)[0])).toEqual(
          0
        );
      });

      it("should return the minimum y minus a 10 percent buffer otherwise", () => {
        const metricsWith: VictoryMetric[] = [
          { name: "metric1", values: [{ x: new Date(2020, 1, 1), y: 0.5 }] },
          { name: "metric1", values: [{ x: new Date(2020, 1, 1), y: 0.4 }] },
        ];
        expect(roundToOneDecimal(yDomainFromMetrics(metricsWith)[0])).toEqual(
          0.3
        );
      });
    });
    describe("max y", () => {
      it("should return 1 if the mininum y is over 0.8", () => {
        const metricsWith: VictoryMetric[] = [
          { name: "metric1", values: [{ x: new Date(2020, 1, 1), y: 0.7 }] },
          { name: "metric1", values: [{ x: new Date(2020, 1, 1), y: 0.9 }] },
        ];

        expect(roundToOneDecimal(yDomainFromMetrics(metricsWith)[1])).toEqual(
          1
        );
      });

      it("should return the max y + 10% buffer otherwise", () => {
        const metricsWith: VictoryMetric[] = [
          { name: "metric1", values: [{ x: new Date(2020, 1, 1), y: 0.7 }] },
          { name: "metric1", values: [{ x: new Date(2020, 1, 1), y: 0.6 }] },
        ];

        expect(roundToOneDecimal(yDomainFromMetrics(metricsWith)[1])).toEqual(
          0.8
        );
      });
    });
  });
});
