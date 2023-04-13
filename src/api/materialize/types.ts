export interface Notice {
  message: string;
  severity: string;
}

export interface SqlRowResult {
  tag: string;
  rows: any[][];
  col_names: string[];
  notices: Notice[];
}

export interface SqlOkResult {
  ok: string;
  notices: Notice[];
}

export interface SqlErrorResult {
  error: string;
  notices: Notice[];
}

export type SqlResult = SqlRowResult | SqlOkResult | SqlErrorResult;
