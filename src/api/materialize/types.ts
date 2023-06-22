import { PostgresError as ErrorCode } from "pg-error-enum";

import { SchemaObject } from "../materialized";

export { ErrorCode };

/** Types copied from https://materialize.com/docs/integrations/http-api/#output-format */
export interface SimpleRequest {
  query: string;
}

export interface ExtendedRequest {
  query: string;
  params?: (string | null)[];
}

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

export interface Notice {
  message: string;
  severity: NoticeSeverity;
  detail?: string;
  hint?: string;
}

export interface Error {
  message: string;
  /* Postgres error code from https://www.postgresql.org/docs/current/errcodes-appendix.html */
  code: ErrorCode;
  detail?: string;
  hint?: string;
}

export type SqlResult =
  | {
      tag: string;
      rows: any[][];
      col_names: string[];
      notices: Notice[];
    }
  | {
      ok: string;
      notices: Notice[];
    }
  | {
      error: Error;
      notices: Notice[];
    };

export interface ClusterReplica {
  id: string;
  name: string;
  clusterName: string;
}

export interface Cluster {
  id: string;
  name: string;
}

export type DatabaseObject = SchemaObject | Cluster | ClusterReplica;
