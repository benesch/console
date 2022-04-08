import React from "react";

import { useDeploymentsMetricsCpuRetrieve } from "../../../api/backend";
import MetricsLineChart from "./components/MetricsLineChart";
import { useRetrieveMetrics } from "./hooks";

const CpuMetrics: React.FC<{ deploymentId: string }> = React.memo(
  ({ deploymentId }) => {
    const hook = useRetrieveMetrics(
      deploymentId,
      useDeploymentsMetricsCpuRetrieve
    );
    return <MetricsLineChart {...hook} />;
  }
);

export default CpuMetrics;
