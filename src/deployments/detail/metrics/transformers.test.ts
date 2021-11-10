import { validPrometheusValues } from "../../__mocks__";
import {
  formatFullDateTime,
  formatXToReadableDateTime,
  formatYToPercentage,
  prometheusMetricsToVictoryMetrics,
} from "./transformers";

describe("prometheusMetricsToVictoryMetrics", () => {
  it("should return an array of x/y coordinates", () => {
    const result = prometheusMetricsToVictoryMetrics(validPrometheusValues);

    expect(
      result.every((metric) =>
        metric.values.every(
          (datapoint) => datapoint.x !== undefined && datapoint.y !== undefined
        )
      )
    ).toBeTruthy();
  });

  it("x coordinates should be Date object", () => {
    const result = prometheusMetricsToVictoryMetrics(validPrometheusValues);
    const firstMetric = result[0];
    expect(firstMetric.values[0].x instanceof Date).toBeTruthy();
    // the stringified timestamp should be parsed correctly
    expect((+firstMetric.values[0].x / 1000).toString()).toEqual(
      validPrometheusValues.metrics[0].values[0][0]
    );
  });
  it("y coordinates should be floats", () => {
    const result = prometheusMetricsToVictoryMetrics(validPrometheusValues);
    const firstMetric = result[0];
    expect(firstMetric.values[0].y).toEqual(
      parseFloat(validPrometheusValues.metrics[0].values[0][1])
    );
  });
});

describe("formatters", () => {
  test("formatYToPercentage", () => {
    expect(formatYToPercentage(0.2)).toEqual("20");
  });

  test("formatFullDateTime", () => {
    expect(formatFullDateTime(new Date(2020, 1, 1, 1, 1))).toEqual(
      "20-02-01 01:01"
    );
  });

  test("formatToDayAndTime", () => {
    expect(formatFullDateTime(new Date(2020, 1, 1, 1, 1))).toEqual(
      "20-02-01 01:01"
    );
  });

  test("formatToDayAndTime", () => {
    expect(formatFullDateTime(new Date(2020, 1, 1, 1, 1))).toEqual(
      "20-02-01 01:01"
    );
  });

  describe("formatXToReadableDateTime", () => {
    it("should format to time only if the period is less than 60 minutes", () => {
      expect(formatXToReadableDateTime(60)(new Date(2020, 1, 1, 1, 1))).toEqual(
        "01:01"
      );
    });

    it("should format to date and time otherwise", () => {
      expect(
        formatXToReadableDateTime(120)(new Date(2020, 1, 1, 1, 1))
      ).toEqual("01-02 01:01");
    });
  });
});
