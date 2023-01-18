import { useAuth } from "@frontegg/react";
import React, { Dispatch, SetStateAction } from "react";
import { useRecoilValue_TRANSITION_SUPPORT_UNSTABLE } from "recoil";

import { currentEnvironmentState } from "~/recoil/environments";

import { ExplainTimestampResult } from "../materialized";

export interface SimpleRequest {
  query: string;
}

export interface ExtendedRequestItem {
  query: string;
  params?: (string | null)[];
}

export interface ExtendedRequest {
  queries: ExtendedRequestItem[];
}

export type SqlRequest = SimpleRequest | ExtendedRequest;

// Based on https://github.com/MaterializeInc/materialize/blob/67ceb5670b515887357624709acb904e7f39f42b/src/pgwire/src/message.rs#L446-L456
export type NoticeSeverity =
  | "Panic"
  | "Fatal"
  | "Error"
  | "Warning"
  | "Notice"
  | "Debug"
  | "Info"
  | "Log";

export interface NoticeResponse {
  message: string;
  severity: NoticeSeverity;
}

export type WebSocketResult =
  | { type: "ReadyForQuery"; payload: string }
  | { type: "Notice"; payload: NoticeResponse }
  | { type: "CommandComplete"; payload: string }
  | { type: "Error"; payload: string }
  | { type: "Rows"; payload: string[] }
  | { type: "Row"; payload: unknown[] };

export class SqlWebSocket {
  socket: WebSocket;
  setSocketReady: Dispatch<SetStateAction<boolean>>;

  constructor(
    socket: WebSocket,
    setSocketReady: Dispatch<SetStateAction<boolean>>
  ) {
    this.socket = socket;
    this.setSocketReady = setSocketReady;
  }

  send(request: SqlRequest) {
    this.setSocketReady(false);
    this.socket.send(JSON.stringify(request));
  }

  onResult(callback: (data: WebSocketResult) => void) {
    this.socket.onmessage = function (event) {
      callback(JSON.parse(event.data) as WebSocketResult);
    };
  }

  onOpen(callback: (event: Event) => void) {
    this.socket.onopen = callback;
  }
}

export const useSqlWs = () => {
  const { user } = useAuth();
  const currentEnvironment = useRecoilValue_TRANSITION_SUPPORT_UNSTABLE(
    currentEnvironmentState
  );
  const [socket, setSocket] = React.useState<SqlWebSocket | null>(null);
  const [socketReady, setSocketReady] = React.useState<boolean>(false);
  const [socketError, setSocketError] = React.useState<string | null>(null);

  const accessToken = user?.accessToken;

  const handleMessage = React.useCallback((event: MessageEvent) => {
    const data = JSON.parse(event.data);
    if (data.type === "ReadyForQuery") {
      setSocketReady(true);
    }
  }, []);
  const handleClose = React.useCallback((_: CloseEvent) => {
    setSocketReady(false);
    setSocketError("Connection error");
  }, []);
  React.useEffect(() => {
    let ws: WebSocket;
    if (
      accessToken &&
      currentEnvironment?.state === "enabled" &&
      currentEnvironment.health === "crashed"
    ) {
      setSocketError("Region unavailable");
    }
    if (
      accessToken &&
      currentEnvironment?.state === "enabled" &&
      currentEnvironment.health === "healthy"
    ) {
      ws = new WebSocket(
        `wss://${currentEnvironment.environmentdHttpsAddress}/api/experimental/sql`
      );
      setSocketError(null);
      ws.addEventListener("message", handleMessage);
      ws.onopen = function () {
        ws.send(
          JSON.stringify({
            token: accessToken,
          })
        );
      };
      ws.addEventListener("close", handleClose);

      setSocket(new SqlWebSocket(ws, setSocketReady));
    }
    return () => {
      setSocketError(null);
      setSocket(null);
      setSocketReady(false);
      if (ws) {
        ws.close();
        ws.removeEventListener("close", handleClose);
        ws.removeEventListener("message", handleMessage);
      }
    };
  }, [currentEnvironment, handleClose, handleMessage, accessToken]);

  return { socketReady, socket, socketError };
};

export interface ReplicaUtilization {
  id: number;
  timestamp: number;
  cpuPercent: number;
  memoryPercent: number;
}

export const useClusterUtilization = (
  clusterId: string | undefined,
  startTime: Date,
  endTime: Date,
  replicaId?: number
) => {
  const [data, setData] = React.useState<ReplicaUtilization[] | null>(null);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [explainSent, setExplainSent] = React.useState<boolean>(false);
  const [querySent, setQuerySent] = React.useState<boolean>(false);
  const [minFrontier, setMinFrontier] = React.useState<number | undefined>();
  const { socketReady, socket, socketError } = useSqlWs();

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
  }, [socket, replicaId, clusterId, startTime, endTime]);

  React.useEffect(() => {
    if (!socket || !clusterId) return;

    const utilizationQuery = `SELECT r.id,
  u.cpu_percent_normalized,
  u.memory_percent
FROM mz_cluster_replicas r
JOIN mz_internal.mz_cluster_replica_utilization u ON u.replica_id = r.id
WHERE r.cluster_id = '${clusterId}'
${replicaId ? `AND r.id = ${replicaId}` : ""}`;

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
          // ignore retractions
          if (mzdiff === 1) {
            const utilization: ReplicaUtilization = {
              id: result.payload[2] as number,
              timestamp: parseInt(result.payload[0] as string),
              cpuPercent: result.payload[3] as number,
              memoryPercent: result.payload[4] as number,
            };
            setData((val) => (val ? [...val, utilization] : [utilization]));
          }
        }
      }
    });

    socket.socket.onerror = function (event) {
      console.error("[websocket error]", event);
      setErrors((val) => [...val, "Unexpected error"]);
    };
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

  return { data, errors };
};
