import React from "react";

import { useDeploymentsMetricsMemoryRetrieve } from "../../../api/api";
import MetricsLineChart from "./components/MetricsLineChart";
import { useRetrieveMetrics } from "./hooks";

const MemoryMetrics: React.FC<{ deploymentId: string }> = React.memo(
  ({ deploymentId }) => {
    const hook = useRetrieveMetrics(
      deploymentId,
      useDeploymentsMetricsMemoryRetrieve
    );

    return <MetricsLineChart {...hook} />;
  }
);

export default MemoryMetrics;
