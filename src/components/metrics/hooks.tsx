import { useInterval } from "@chakra-ui/hooks";
import React from "react";
import { UseGetReturn } from "restful-react";

import { PrometheusMetrics } from "../../api/backend";
import { defaultMetricPeriod } from "./components/MetricPeriodSelector";
import {
  Domains,
  inferDomainFromValues,
  inferTicksFromDomain,
} from "./domains";
import { prometheusMetricsToVictoryMetrics } from "./transformers";
import { VictoryMetric } from "./types";

export type GetMetricsHook = (parameters: {
  id: string;
  period: number;
}) => UseGetReturn<PrometheusMetrics, unknown, void, unknown>;

export type UseRetrieveMetrics = {
  operation: ReturnType<GetMetricsHook>;

  chart: {
    data: VictoryMetric[];
    domains: Domains;
    ticks: number[];
  };
  filters: {
    period: number;
    setPeriod: (period: number) => void;
  };
};

export const useRetrieveMetrics = (
  deploymentId: string,
  hook: GetMetricsHook
): UseRetrieveMetrics => {
  const [period, setPeriod] = React.useState<number>(defaultMetricPeriod);
  const operation = hook({
    id: deploymentId,
    period,
  });

  useInterval(operation.refetch, 30000);

  const victoryCompatibleMetrics = prometheusMetricsToVictoryMetrics(
    operation.data
  );

  const domains = inferDomainFromValues(victoryCompatibleMetrics);

  return {
    operation,
    chart: {
      data: victoryCompatibleMetrics,
      domains,
      ticks: inferTicksFromDomain(domains),
    },
    filters: {
      period,
      setPeriod,
    },
  };
};
