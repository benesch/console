import React, { Dispatch, SetStateAction } from "react";
import { useRecoilValue_TRANSITION_SUPPORT_UNSTABLE } from "recoil";

import { useAuth } from "~/api/auth";
import { currentEnvironmentState } from "~/recoil/environments";

import { APPLICATION_NAME } from ".";
import { Error, Notice } from "./types";

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

export interface ParameterStatus {
  name: string;
  value: string;
}

export interface CommandStarting {
  has_rows: boolean;
  is_streaming: boolean;
}

export interface BackendKeyData {
  conn_id: number;
  secret_key: number;
}

export type WebSocketResult =
  | { type: "ReadyForQuery"; payload: string }
  | { type: "Notice"; payload: Notice }
  | { type: "CommandComplete"; payload: string }
  | { type: "Error"; payload: Error }
  | { type: "Rows"; payload: string[] }
  | { type: "Row"; payload: unknown[] }
  | { type: "ParameterStatus"; payload: ParameterStatus }
  | { type: "CommandStarting"; payload: CommandStarting }
  | { type: "BackendKeyData"; payload: BackendKeyData };

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

type AuthOptions = { [name: string]: string };

const DEFAULT_AUTH_OPTIONS: AuthOptions = {
  application_name: APPLICATION_NAME,
};

export const useSqlWs = ({
  open,
  authOptions,
}: {
  open: boolean;
  authOptions?: AuthOptions;
}) => {
  const currentEnvironment = useRecoilValue_TRANSITION_SUPPORT_UNSTABLE(
    currentEnvironmentState
  );
  const [socket, setSocket] = React.useState<SqlWebSocket | null>(null);
  const [socketReady, setSocketReady] = React.useState<boolean>(false);
  const [socketError, setSocketError] = React.useState<string | null>(null);

  const {
    user: { accessToken },
  } = useAuth();

  // This ref allows us to avoid triggering useEffect when accessToken changes.
  // We use a ref since we don't want to sync our websocket connection with the access token, but still use the most up-to-date one when reconnecting.
  const accessTokenRef = React.useRef(accessToken);

  if (accessTokenRef.current !== accessToken) {
    accessTokenRef.current = accessToken;
  }

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

  const handleError = React.useCallback((e: Event) => {
    setSocketReady(false);
    setSocketError("Unexpected error");
  }, []);

  const closeSocket = React.useCallback(
    (ws?: WebSocket) => {
      if (!ws) return;
      // In Safari, error and close callbacks trigger even if we close the socket, so remove them before closing
      ws.removeEventListener("error", handleError);
      ws.removeEventListener("close", handleClose);
      ws.removeEventListener("message", handleMessage);
      ws.close();
    },
    [handleClose, handleError, handleMessage]
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
      accessTokenRef.current &&
      currentEnvironment?.state === "enabled" &&
      currentEnvironment.status.health === "crashed"
    ) {
      setSocketError("Region unavailable");
    }
    if (
      accessTokenRef.current &&
      currentEnvironment?.state === "enabled" &&
      currentEnvironment.status.health === "healthy"
    ) {
      ws = new WebSocket(
        `wss://${currentEnvironment.environmentdHttpsAddress}/api/experimental/sql`
      );
      // Optional session vars to provide on startup of the WebSocket.

      setSocketError(null);
      ws.addEventListener("message", handleMessage);
      ws.onopen = function () {
        ws.send(
          JSON.stringify({
            token: accessTokenRef.current,
            options: authOptions ?? DEFAULT_AUTH_OPTIONS,
          })
        );
      };
      ws.addEventListener("close", handleClose);
      ws.addEventListener("error", handleError);

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
  }, [
    currentEnvironment,
    handleClose,
    handleError,
    handleMessage,
    open,
    authOptions,
  ]);

  return { socketReady, socket, socketError };
};
