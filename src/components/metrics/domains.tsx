import { VictoryMetric } from "./types";

export interface Domains {
  x: [Date, Date];
  y: [number, number];
}

export const xDomainFromMetrics = (metrics: VictoryMetric[]): [Date, Date] => {
  // even if multiple metrics are returned, they should be aligned on the x-axis and already sorted
  const earliestTime = metrics[0]?.values[0].x || new Date();
  return [earliestTime, new Date()];
};

export const yDomainFromMetrics = (
  metrics: VictoryMetric[]
): [number, number] => {
  const onlyValues = metrics.flatMap((metric) =>
    metric.values.map(({ y }) => y)
  );

  const maxY = Math.max(...onlyValues);

  // empirical heuristics to show the relevant part of the graph +/- some buffer
  // since our ticks usually go by 20, we extend the graph to the next 20%
  // if it goes over 100
  const maxYWithBuffer = maxY < 1 ? 1 : Math.ceil(maxY / 0.2) * 0.2;
  return [0, maxYWithBuffer];
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

export const inferTicksFromDomain = (domains: Domains) => {
  const DEFAULT_Y_TICK_LENGTH = 0.2;
  let tick = 0;
  const yTickLength =
    Math.floor(Math.max(domains.y[1] / 5, DEFAULT_Y_TICK_LENGTH) * 10) / 10;
  const ticks = [];

  while (tick < domains.y[1] + yTickLength) {
    ticks.push(tick);
    tick += yTickLength;
  }
  return ticks;
};
