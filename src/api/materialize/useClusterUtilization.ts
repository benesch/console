import React from "react";

import { ExplainTimestampResult } from "../materialized";
import { useSqlWs } from "./websocket";

export interface ReplicaUtilization {
  id: string;
  timestamp: number;
  cpuPercent: number;
  memoryPercent: number;
}

const useClusterUtilization = (
  clusterId: string | undefined,
  startTime: Date,
  endTime: Date,
  replicaId?: string
) => {
  const [data, setData] = React.useState<ReplicaUtilization[] | null>(null);
  const [commandComplete, setCommandComplete] = React.useState<boolean>(false);
  const [isStale, setIsStale] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [explainSent, setExplainSent] = React.useState<boolean>(false);
  const [querySent, setQuerySent] = React.useState<boolean>(false);
  const [minFrontier, setMinFrontier] = React.useState<number | undefined>();
  const { socketReady, socket, socketError } = useSqlWs({
    open: !commandComplete,
  });

  React.useEffect(() => {
    if (socketError) {
      setErrors([socketError]);
    }
    return () => {
      setErrors([]);
    };
  }, [socketError]);

  React.useEffect(() => {
    setQuerySent(false);
    setExplainSent(false);
    setMinFrontier(undefined);
    setIsStale(true);
    setCommandComplete(false);
    const interval = setInterval(() => {
      // If there are changes since the last interval, push them into react state and clear the buffer
      if (socketBufferRef.current.length > 0) {
        setData((val) => {
          const newVal = [...(val ?? []), ...socketBufferRef.current];
          socketBufferRef.current = [];
          return newVal;
        });
      }
    }, 100);
    return () => {
      clearInterval(interval);
    };
  }, [replicaId, clusterId, startTime, endTime]);

  const socketBufferRef = React.useRef<ReplicaUtilization[]>([]);

  React.useEffect(() => {
    if (!socket || !clusterId) return;

    const utilizationQuery = `SELECT r.id,
  u.cpu_percent,
  u.memory_percent
FROM mz_cluster_replicas r
JOIN mz_internal.mz_cluster_replica_utilization u ON u.replica_id = r.id
WHERE r.cluster_id = '${clusterId}'
${replicaId ? `AND r.id = '${replicaId}'` : ""}`;

    // first we fetch the minimum frontier we can query
    if (socketReady && !explainSent) {
      socket.send({
        query: `SET CLUSTER = mz_introspection; EXPLAIN TIMESTAMP AS JSON FOR ${utilizationQuery};`,
      });
      setExplainSent(true);
    }
    // now we can fetch the utilization data
    if (socketReady && minFrontier && !querySent) {
      const frontier = new Date(minFrontier);
      let start = startTime;
      if (start < frontier) {
        start = frontier;
      }
      if (start > endTime) {
        // We observed this at least once when the compaction window was not set
        start = endTime;
      }
      socket.send({
        query: `SUBSCRIBE (${utilizationQuery})
  AS OF TIMESTAMP '${start.toISOString()}'
  UP TO TIMESTAMP '${endTime.toISOString()}';`,
      });
      setQuerySent(true);
      setData(null);
      socketBufferRef.current = [];
    }

    socket.onResult((result) => {
      if (result.type === "Error") {
        setErrors((val) => [...val, result.payload]);
      }
      if (result.type === "Row") {
        const { determination } = JSON.parse(
          result.payload[0] as string
        ) as ExplainTimestampResult;
        // If we have sent the explain query, but don't yet have a minFrontier,
        // we expect this to be the explain result
        if (explainSent && !minFrontier && determination) {
          setMinFrontier(determination.since.elements[0]);
        } else if (querySent) {
          // If querySent is false, it means we are still getting results from a previous query,
          // but we ignore them, since the user has already changed the time period
          const mzdiff = result.payload[1] as number;
          const id = result.payload[2] as string;
          // ignore retractions
          if (mzdiff === 1) {
            const utilization: ReplicaUtilization = {
              id: id.toString(),
              timestamp: parseInt(result.payload[0] as string),
              cpuPercent: result.payload[3] as number,
              memoryPercent: result.payload[4] as number,
            };
            socketBufferRef.current.push(utilization);
            setIsStale(false);
          }
        }
      }
      if (querySent && result.type === "CommandComplete") {
        setCommandComplete(true);
      }
    });
  }, [
    clusterId,
    socketReady,
    querySent,
    explainSent,
    minFrontier,
    startTime,
    endTime,
    replicaId,
    socket,
  ]);

  return { data, errors, isStale };
};

export default useClusterUtilization;
