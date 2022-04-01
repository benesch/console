import React from "react";

import { useDeploymentsMetricsMemoryRetrieve } from "../../../api/backend";
import MetricsLineChart from "../../../components/metrics/components/MetricsLineChart";
import { useRetrieveMetrics } from "../../../components/metrics/hooks";

const MemoryMetrics: React.FC<{ deploymentId: string }> = React.memo(
  ({ deploymentId }) => {
    const hook = useRetrieveMetrics(
      deploymentId,
      useDeploymentsMetricsMemoryRetrieve
    );

    return (
      <MetricsLineChart
        {...hook}
        testId="fetch-deployment-metric-error"
        errorMessage="Failed to load metrics for this deployment"
      />
    );
  }
);

export default MemoryMetrics;
