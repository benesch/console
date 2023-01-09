import { useAuth } from "@frontegg/react";
import React, { MutableRefObject } from "react";
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

export interface NoticeResponse {
  message: string;
  severity: string;
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

  constructor(socket: WebSocket) {
    this.socket = socket;
  }

  send(request: SqlRequest) {
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

export const useSqlWs = (): [
  boolean,
  MutableRefObject<SqlWebSocket | undefined>
] => {
  const { user } = useAuth();
  const currentEnvironment = useRecoilValue_TRANSITION_SUPPORT_UNSTABLE(
    currentEnvironmentState
  );
  const socketRef = React.useRef<SqlWebSocket>();
  const [socketReady, setSocketReady] = React.useState<boolean>(false);

  React.useEffect(() => {
    let socket: WebSocket;
    if (user && currentEnvironment?.state === "enabled") {
      socket = new WebSocket(
        `wss://${currentEnvironment.environmentdHttpsAddress}/api/experimental/sql`
      );
      socket.addEventListener("message", (event: MessageEvent) => {
        if (event.data.payload === "ReadyForQuery") {
          setSocketReady(true);
        }
      });
      socket.onopen = function () {
        socket.send(
          JSON.stringify({
            token: user?.accessToken,
          })
        );
        setSocketReady(true);
      };
      socket.onclose = function (event) {
        if (event.wasClean) {
          console.log(
            `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
          );
        } else {
          // this happens when the client closes the connection, which seems odd
          // event.code is usually 1006 in this case
          console.log("[close] Connection died", event);
        }
      };

      socketRef.current = new SqlWebSocket(socket);
    }
    return () => {
      console.log("unmount", socket);
      if (socket) {
        console.log("socket.close()");
        socket.close();
        socketRef.current = undefined;
        setSocketReady(false);
      }
    };
  }, [currentEnvironment, user, user?.accessToken]);

  return [socketReady, socketRef];
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
  endTime: Date
) => {
  const [data, setData] = React.useState<ReplicaUtilization[] | null>(null);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [explainSent, setExplainSent] = React.useState<boolean>(false);
  const [querySent, setQuerySent] = React.useState<boolean>(false);
  const [minFrontier, setMinFrontier] = React.useState<number | undefined>();
  const [socketReady, socketRef] = useSqlWs();

  React.useEffect(() => {
    setQuerySent(false);
    setExplainSent(false);
  }, [clusterId, startTime, endTime]);

  React.useEffect(() => {
    const ws = socketRef.current;
    if (!ws || !clusterId) return;

    const utilizationQuery = `SELECT r.id,
  u.cpu_percent_normalized,
  u.memory_percent
FROM mz_cluster_replicas r
JOIN mz_internal.mz_cluster_replica_utilization u ON u.replica_id = r.id
WHERE r.cluster_id = '${clusterId}'`;

    // first we fetch the minimum frontier we can query
    if (socketReady && !explainSent) {
      ws.send({
        query: `EXPLAIN TIMESTAMP AS JSON FOR ${utilizationQuery};`,
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
      ws.send({
        query: `SUBSCRIBE (${utilizationQuery})
  AS OF TIMESTAMP '${start.toISOString()}'
  UP TO TIMESTAMP '${endTime.toISOString()}';`,
      });
      setQuerySent(true);
    }

    ws.onResult((result) => {
      if (result.type === "Error") {
        setErrors((val) => [...val, result.payload]);
      }
      if (result.type === "Row") {
        if (!minFrontier) {
          const { determination } = JSON.parse(
            result.payload[0] as string
          ) as ExplainTimestampResult;
          setMinFrontier(determination.since.elements[0]);
        } else {
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

    ws.socket.onerror = function (event) {
      console.log("[error]", event);
    };
  }, [
    socketRef,
    clusterId,
    socketReady,
    querySent,
    explainSent,
    minFrontier,
    startTime,
    endTime,
  ]);

  return { data, errors };
};
