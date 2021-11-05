import { useInterval } from "@chakra-ui/hooks";
import React, { useEffect } from "react";
import { UseGetReturn } from "restful-react";

import { PrometheusMetrics } from "../../../api/api";
import { Domains, inferDomainFromValues } from "./domains";
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
  };
  filters: {
    setPeriod: (period: number) => void;
  };
};

export const useRetrieveMetrics = (
  deploymentId: string,
  hook: GetMetricsHook
): UseRetrieveMetrics => {
  const [period, setPeriod] = React.useState<number>(5);
  const operation = hook({
    id: deploymentId,
    period,
  });
  useInterval(operation.refetch, 5000);
  useEffect(() => {
    operation.refetch();
  }, [period]);

  const victoryCompatibleMetrics = prometheusMetricsToVictoryMetrics(
    operation.data
  );

  return {
    operation,
    chart: {
      data: victoryCompatibleMetrics,
      domains: inferDomainFromValues(victoryCompatibleMetrics),
    },
    filters: {
      setPeriod,
    },
  };
};
