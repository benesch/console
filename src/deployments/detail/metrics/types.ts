import { PrometheusMetric } from "../../../api/api";

export interface VictoryTimedDataPoint {
  x: Date;
  y: number;
}

export interface VictoryMetric extends Omit<PrometheusMetric, "values"> {
  values: VictoryTimedDataPoint[];
}
