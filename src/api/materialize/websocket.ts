import { useAuth } from "@frontegg/react";
import React, { Dispatch, SetStateAction } from "react";
import { useRecoilValue_TRANSITION_SUPPORT_UNSTABLE } from "recoil";

import { currentEnvironmentState } from "~/recoil/environments";

import { APPLICATION_NAME } from "../materialized";

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

export const useSqlWs = ({ open }: { open: boolean }) => {
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

  const closeSocket = React.useCallback(
    (ws?: WebSocket) => {
      if (!ws) return;
      ws.close();
      ws.removeEventListener("close", handleClose);
      ws.removeEventListener("message", handleMessage);
    },
    [handleClose, handleMessage]
  );

  React.useEffect(() => {
    if (!socket) return;

    if (!open) {
      closeSocket(socket.socket);
    }
  }, [closeSocket, open, socket]);

  React.useEffect(() => {
    if (!open) return;

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
      // Optional session vars to provide on startup of the WebSocket.
      const options = { application_name: APPLICATION_NAME };

      setSocketError(null);
      ws.addEventListener("message", handleMessage);
      ws.onopen = function () {
        ws.send(
          JSON.stringify({
            token: accessToken,
            options,
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
  }, [currentEnvironment, handleClose, handleMessage, accessToken, open]);

  return { socketReady, socket, socketError };
};
