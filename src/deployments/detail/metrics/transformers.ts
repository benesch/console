import flatten from "lodash/flatten";

import { PrometheusMetrics } from "../../../api/api";
import { VictoryMetric } from "./types";

/** formatting data to be readable for display on bi-directional graph */
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
          y: parseFloat(value[1]) + 0.4,
        };
      }),
    };
  });
};

export const inferDomainFromValues = (
  metrics: VictoryMetric[]
): { x: [Date, Date]; y: [number, number] } => {
  const onlyValues = flatten(
    metrics.map((metric) => metric.values.map(({ y }) => y))
  );

  const startTimeStamp = metrics[0]?.values[0].x;
  const min = Math.min(...onlyValues);
  const max = Math.max(...onlyValues);

  return {
    x: [startTimeStamp, new Date()],
    y: [min > 0.2 ? min - 0.1 : 0, max < 0.8 ? max + 0.1 : 1],
  };
};
