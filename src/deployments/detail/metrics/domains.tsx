import { VictoryMetric } from "./types";

export interface Domains {
  x: [Date, Date];
  y: [number, number];
}

export const xDomainFromMetrics = (metrics: VictoryMetric[]): [Date, Date] => {
  // even if multiple metrics are returned, they should be aligned on the x-axis and already sorted
  const earliestTime = metrics[0]?.values[0].x;
  return [earliestTime, new Date()];
};

export const yDomainFromMetrics = (
  metrics: VictoryMetric[]
): [number, number] => {
  const onlyValues = metrics.flatMap((metric) =>
    metric.values.map(({ y }) => y)
  );

  const minY = Math.min(...onlyValues);
  const maxY = Math.max(...onlyValues);

  // empirical heuristics to show the relevant part of the graph +/- some buffer
  const minYWithBuffer = minY > 0.2 ? minY - 0.1 : 0;
  const maxYWithBuffer = maxY < 0.8 ? maxY + 0.1 : 1;

  return [minYWithBuffer, maxYWithBuffer];
};

/**
 * compute extremums values (+ buffers) for both axis domains
 */
export const inferDomainFromValues = (metrics: VictoryMetric[]): Domains => {
  return {
    x: xDomainFromMetrics(metrics),
    y: yDomainFromMetrics(metrics),
  };
};
