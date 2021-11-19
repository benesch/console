import { useInterval } from "@chakra-ui/hooks";
import React from "react";
import { UseGetReturn } from "restful-react";

import { Deployment, PrometheusMetrics } from "../../../api/api";
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
    period: number;
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
      period,
      setPeriod,
    },
  };
};

export const isSupportedRegionForMetrics = (deployment: Deployment) => {
  return deployment.cloudProviderRegion.region === "us-east-1";
};
