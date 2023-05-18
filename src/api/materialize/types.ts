export { PostgresError as ErrorCode } from "pg-error-enum";

/** Types copied from https://materialize.com/docs/integrations/http-api/#output-format */
export interface Notice {
  message: string;
  severity: string;
  detail?: string;
  hint?: string;
}

export interface Error {
  message: string;
  code: string;
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
