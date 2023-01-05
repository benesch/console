import { Box } from "@chakra-ui/react";
import { subMinutes } from "date-fns";
import React from "react";

import { useSqlWs } from "~/api/materialize/websocket";
import { Cluster, ExplainTimestampResult } from "~/api/materialized";

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
  const [explainSent, setExplainSent] = React.useState<boolean>(false);
  const [querySent, setQuerySent] = React.useState<boolean>(false);
  const [minFrontier, setMinFrontier] = React.useState<number | undefined>();
  const [socketReady, socketRef] = useSqlWs();
  const utilizationQuery = `SELECT r.id,
    u.cpu_percent_normalized,
    u.memory_percent
  FROM mz_cluster_replicas r
  JOIN mz_internal.mz_cluster_replica_utilization u ON u.replica_id = r.id
  WHERE r.cluster_id = '${cluster?.id}'`;

  React.useEffect(() => {
    const ws = socketRef.current;
    if (!ws) return;

    // first we fetch the minimum frontier we can query
    if (socketReady && cluster && !explainSent) {
      ws.send({
        query: `EXPLAIN TIMESTAMP AS JSON FOR ${utilizationQuery};`,
      });
      setExplainSent(true);
    }
    // now we can fetch the utilization data
    if (socketReady && cluster && minFrontier && !querySent) {
      const frontier = new Date(minFrontier);
      const endTime = new Date();
      let startTime = subMinutes(endTime, 1440);
      if (startTime < frontier) {
        startTime = frontier;
      }
      ws.send({
        query: `SUBSCRIBE (${utilizationQuery})
  AS OF TIMESTAMP '${startTime.toISOString()}'
  UP TO TIMESTAMP '${endTime.toISOString()}';`,
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
        if (!minFrontier) {
          const result = JSON.parse(
            data.payload[0] as string
          ) as ExplainTimestampResult;
          setMinFrontier(result.determination.since.elements[0]);
        } else {
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
      }
    });

    ws.socket.onerror = function (event) {
      console.log("[error]", event);
    };
  }, [
    socketRef,
    cluster,
    socketReady,
    querySent,
    explainSent,
    minFrontier,
    utilizationQuery,
  ]);

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
