import { Box } from "@chakra-ui/react";
import { subMinutes } from "date-fns";
import React from "react";

import { useSqlWs } from "~/api/materialize/websocket";
import { Cluster } from "~/api/materialized";

export interface Props {
  cluster?: Cluster;
}

interface ReplicaInfo {
  id: number;
  cpuPercent: number;
  memoryPercent: number;
}

const ClusterOverview = ({ cluster }: Props) => {
  const [results, setResults] = React.useState<ReplicaInfo[]>([]);
  const [querySent, setQuerySent] = React.useState<boolean>(false);
  const [socketReady, socketRef] = useSqlWs();

  React.useEffect(() => {
    const ws = socketRef.current;
    if (!ws) return;

    if (socketReady && cluster && !querySent) {
      const endTime = new Date();
      const startTime = subMinutes(endTime, 5);
      ws.send({
        query: `SUBSCRIBE (
  SELECT r.id,
    u.cpu_percent_normalized,
    u.memory_percent
  FROM mz_cluster_replicas r
  JOIN mz_internal.mz_cluster_replica_utilization u ON u.replica_id = r.id
  WHERE r.cluster_id = '${cluster.id}'
) AS OF TIMESTAMP '${startTime.toISOString()}' UP TO TIMESTAMP '${endTime.toISOString()}';`,
      });
      setQuerySent(true);
    }

    ws.onResult((data) => {
      if (data.type === "Error") {
        console.log("error", data.payload);
      }
      if (data.type === "Rows") {
        console.log("columns", data.payload);
      }
      if (data.type === "Row") {
        const mzdiff = data.payload[1];
        // ignore retractions
        if (mzdiff === 1) {
          setResults((val) => [
            ...val,
            {
              id: data.payload[2] as number,
              cpuPercent: data.payload[3] as number,
              memoryPercent: data.payload[4] as number,
            },
          ]);
        }
      }
    });

    ws.socket.onerror = function (event) {
      console.log("[error]", event);
    };
  }, [socketRef, cluster, socketReady, querySent]);

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
