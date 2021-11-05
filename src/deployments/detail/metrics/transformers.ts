import { PrometheusMetrics } from "../../../api/api";
import { VictoryMetric } from "./types";

/** transforming api data to be in 2-dimensional chart victory format */
export const prometheusMetricsToVictoryMetrics = (
  data: PrometheusMetrics | null
): VictoryMetric[] => {
  if (!data) return [];
  return data.metrics.map((metric): VictoryMetric => {
    return {
      name: metric.name,
      values: metric.values.map((value) => {
        return {
          x: new Date(parseFloat(value[0]) * 1000),
          y: parseFloat(value[1]),
        };
      }),
    };
  });
};
