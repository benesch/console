import { Box } from "@chakra-ui/react";
import { subMinutes } from "date-fns";
import React from "react";

import { useClusterUtilization } from "~/api/materialize/websocket";
import { Cluster } from "~/api/materialized";

export interface Props {
  cluster?: Cluster;
}

const ClusterOverview = ({ cluster }: Props) => {
  const endTime = React.useMemo(() => new Date(), []);
  const [timePeriodMinutes, _setTimePeriodMinutes] = React.useState(60);
  const startTime = React.useMemo(() => {
    return subMinutes(endTime, timePeriodMinutes);
  }, [timePeriodMinutes, endTime]);

  const { results } = useClusterUtilization(cluster?.id, startTime, endTime);

  return (
    <Box>
      <Box>
        Current CPU {results[results.length - 1]?.cpuPercent.toFixed(1)}
      </Box>
      <Box>
        Current Memory {results[results.length - 1]?.memoryPercent.toFixed(1)}
      </Box>
    </Box>
  );
};

export default ClusterOverview;
