import format from "date-fns/format";

import { PrometheusMetrics } from "../../api/backend";
import { roundTo2Decimals } from "../../utils/numbers";
import { isValidDate } from "../../utils/validators";
import { durationsInMinutes } from "./components/MetricPeriodSelector";
import { VictoryDatum, VictoryMetric, VictoryTimedDataPoint } from "./types";

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

export const formatYToPercentage = (y: number) => {
  return `${Math.round(y * 100)}`;
};

export const formatFullDateTime = (date: Date) => format(date, "Pp");

/** A formatter that takes in account the overall timeframe to decide how much info to show */
export const formatXToReadableDateTime =
  (periodInMinutes: number) => (datetime: Date) => {
    if (!isValidDate(datetime)) {
      return "invalid";
    }
    if (periodInMinutes <= durationsInMinutes.day) {
      return format(datetime, "p");
    }
    return format(datetime, "P");
  };

export const formatDatapointLabel = (
  point: VictoryDatum<VictoryTimedDataPoint>
): string => {
  return `${formatFullDateTime(point.datum.x)}\n${roundTo2Decimals(
    point.datum.y * 100
  )}%`;
};
