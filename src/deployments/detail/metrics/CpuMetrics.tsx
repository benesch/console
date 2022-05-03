import React from "react";

import { useDeploymentsMetricsCpuRetrieve } from "../../../api/backend";
import MetricsLineChart from "../../../components/metrics/components/MetricsLineChart";
import { useRetrieveMetrics } from "../../../components/metrics/hooks";

const CpuMetrics: React.FC<{ deploymentId: string }> = React.memo(
  ({ deploymentId }) => {
    const hook = useRetrieveMetrics(
      deploymentId,
      useDeploymentsMetricsCpuRetrieve
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

export default CpuMetrics;
