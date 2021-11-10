import { PrometheusMetric } from "../../../api/api";

export interface VictoryTimedDataPoint {
  x: Date;
  y: number;
}

export interface VictoryMetric extends Omit<PrometheusMetric, "values"> {
  values: VictoryTimedDataPoint[];
}

/** the internal representation of the datapoint in victory
 * This type is used when providing custom components / formatting function to act on data points
 */
export type VictoryDatum<Data> = {
  datum: Data;
};
