import React from "react";

import { useDeploymentsMetricsCpuRetrieve } from "../../../api/api";
import { MetricsLineChart } from "./components/MetricsLineChart";
import { useRetrieveMetrics } from "./hooks";

export const CpuMetrics: React.FC<{ deploymentId: string }> = React.memo(
  ({ deploymentId }) => {
    const hook = useRetrieveMetrics(
      deploymentId,
      useDeploymentsMetricsCpuRetrieve
    );
    return <MetricsLineChart {...hook} />;
  }
);
