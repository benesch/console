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
  // since our ticks go by 20, we extend the graph to the next 20%
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

const Y_TICK_LENGTH = 0.2;
const defaultTicks = [0];
let tick = 0;
while (tick < 1) {
  tick += Y_TICK_LENGTH;
  defaultTicks.push(tick);
}

export const inferTicksFromDomain = (domains: Domains) => {
  const ticks = [...defaultTicks];
  if (domains.y[1] > 1) {
    const extraTickCount = Math.ceil((domains.y[1] - 1.0) / Y_TICK_LENGTH);
    let i = 1;
    while (i <= extraTickCount) {
      ticks.push(1 + i * Y_TICK_LENGTH);
      i += 1;
    }
  }
  return ticks;
};
