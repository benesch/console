import React, { MutableRefObject } from "react";
import { useRecoilValue_TRANSITION_SUPPORT_UNSTABLE } from "recoil";

import { currentEnvironmentState } from "~/recoil/environments";

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
  const currentEnvironment = useRecoilValue_TRANSITION_SUPPORT_UNSTABLE(
    currentEnvironmentState
  );
  const socketRef = React.useRef<SqlWebSocket>();
  const [socketReady, setSocketReady] = React.useState<boolean>(false);

  React.useEffect(() => {
    let socket: WebSocket;
    if (currentEnvironment?.state === "enabled") {
      socket = new WebSocket(
        `wss://${encodeURIComponent("robin@materialize.com")}:@${
          currentEnvironment.environmentdHttpsAddress
        }/api/experimental/sql`
      );
      socket.onopen = function () {
        setSocketReady(true);
      };
      socket.onclose = function (event) {
        if (event.wasClean) {
          console.log(
            `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
          );
        } else {
          // e.g. server process killed or network down
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
  }, [currentEnvironment]);

  return [socketReady, socketRef];
};
