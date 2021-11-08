import React from "react";

import { useDeploymentsMetricsMemoryRetrieve } from "../../../api/api";
import { MetricsLineChart } from "./components/MetricsLineChart";
import { useRetrieveMetrics } from "./hooks";

export const MemoryMetrics: React.FC<{ deploymentId: string }> = ({
  deploymentId,
}) => {
  const hook = useRetrieveMetrics(
    deploymentId,
    useDeploymentsMetricsMemoryRetrieve
  );

  return <MetricsLineChart {...hook} />;
};
