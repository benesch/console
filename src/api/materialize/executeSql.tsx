import { PostgresError } from "pg-error-enum";

import config from "~/config";
import { EnabledEnvironment } from "~/recoil/environments";
import { assert } from "~/util";

import { APPLICATION_NAME, DEFAULT_QUERY_ERROR } from ".";

export interface SqlStatement {
  query: string;
  params: (string | null)[];
}

export interface SqlRequest {
  queries: SqlStatement[];
  cluster: string;
  replica?: string;
}

export interface Results {
  columns: Array<string>;
  rows: Array<any>;
  getColumnByName?: <R, V>(row: R[], name: string) => V;
}

interface ExecuteSqlSuccess {
  results: Results[];
}

type GenericError = { errorMessage: string };

type NetworkError = GenericError & {
  status: number;
};

type MaterializeError = GenericError & {
  /* Postgres error code from https://www.postgresql.org/docs/current/errcodes-appendix.html */
  code: PostgresError;
  detail?: string;
  hint?: string;
};

export type ExecuteSqlError = MaterializeError | NetworkError | GenericError;

type ExecuteSqlOutput = ExecuteSqlSuccess | ExecuteSqlError;

export function isError(error: unknown): error is ExecuteSqlError {
  return error != null && typeof error === "object" && "errorMessage" in error;
}

const executeSql = async (
  environment: EnabledEnvironment,
  request: SqlRequest,
  accessToken: string,
  requestOpts?: RequestInit
): Promise<ExecuteSqlOutput> => {
  assert(environment.resolvable);

  const address = environment.environmentdHttpsAddress;
  if (!address) {
    return { errorMessage: "environment not enabled" };
  }

  const url = new URL(`${config.environmentdScheme}://${address}/api/sql`);

  // Optional session vars that will be set before running the request.
  //
  // Note: the JSON object is automatically URI encoded by the URL object.
  const options = {
    application_name: APPLICATION_NAME,
    cluster: request.cluster,
    cluster_replica: request.replica,
  };
  url.searchParams.append("options", JSON.stringify(options));

  const response = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      queries: request.queries,
    }),
    ...requestOpts,
  });

  const responseText = await response.text();

  if (!response.ok) {
    return {
      status: response.status,
      errorMessage: responseText ?? DEFAULT_QUERY_ERROR,
    };
  } else {
    const parsedResponse = JSON.parse(responseText);
    const { results } = parsedResponse;
    const outResults = [];
    for (const oneResult of results) {
      // Queries like `CREATE TABLE` or `CREATE CLUSTER` returns a null inside the results array
      const { error: resultsError, rows, col_names } = oneResult || {};
      let getColumnByName = undefined;
      if (col_names) {
        const columnMap = new Map(
          (col_names as string[]).map((name, index) => [name, index])
        );
        getColumnByName = (row: any[], name: string) => {
          const index = columnMap.get(name);
          if (index === undefined) {
            throw new Error(`Column named ${name} not found`);
          }

          return row[index];
        };
      }
      if (resultsError) {
        return {
          errorMessage: resultsError.message,
          code: resultsError.code,
          detail: resultsError.detail,
          hint: resultsError.hint,
        };
      } else {
        outResults.push({
          rows: rows,
          columns: col_names,
          getColumnByName,
        });
      }
    }
    return { results: outResults };
  }
};

export default executeSql;
