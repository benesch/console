import { validPrometheusValues } from "../../__mocks__";
import { prometheusMetricsToVictoryMetrics } from "./transformers";

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
