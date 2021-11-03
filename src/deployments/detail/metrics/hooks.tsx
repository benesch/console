import { useInterval } from "@chakra-ui/hooks";
import React, { useEffect } from "react";

import {
  useDeploymentsMetricsCpuRetrieve,
  useDeploymentsMetricsMemoryRetrieve,
} from "../../../api/api";
import { prometheusMetricsToVictoryMetrics } from "./transformers";

export const useDeploymentMemoryMetrics = (id: string) => {
  const [period, setPeriod] = React.useState<number>(5);
  const operation = useDeploymentsMetricsMemoryRetrieve({
    id,
    period,
  });
  useInterval(operation.refetch, 5000);
  useEffect(() => {
    operation.refetch();
  }, [period]);

  return {
    operation: {
      ...operation,
      data: prometheusMetricsToVictoryMetrics(operation.data),
    },
    setPeriod,
  };
};

export const useDeploymentCpuMetrics = (id: string) => {
  const [period, setPeriod] = React.useState<number>(5);
  const operation = useDeploymentsMetricsCpuRetrieve({
    id,
    period,
  });
  useInterval(operation.refetch, 5000);
  useEffect(() => {
    operation.refetch();
  }, [period]);

  return {
    operation: {
      ...operation,
      data: prometheusMetricsToVictoryMetrics(operation.data),
    },
    setPeriod,
  };
};
