/**
 * @module
 * materialized SQL API.
 */

import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";

import { currentEnvironment } from "../recoil/environments";
import { FetchAuthedType, useAuth } from "./auth";
import { Environment } from "./environment-controller";

export interface Results {
  columns: Array<string>;
  rows: Array<any>;
}

/**
 * useSql hook state implementation
 * @param sql
 * @param environment
 * @returns
 */
function useSqlInternal(
  sql: string | undefined,
  environment: Environment | undefined | null
) {
  const { fetchAuthed } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState<string | null>(null);
  const defaultError = "Error running query.";

  async function runSql() {
    if (!environment || !sql) {
      setResults(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { results, errorMessage } = await executeSql(
        environment,
        sql,
        fetchAuthed
      );
      if (errorMessage) {
        setResults(null);
        setError(errorMessage);
      } else {
        setResults(results);
        setError(null);
      }
    } catch (err) {
      console.error(err);
      setError(defaultError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setResults(null);
    setLoading(false);
    setError(null);
    runSql();
  }, [environment?.resolvable, environment?.environmentdHttpsAddress, sql]);

  return { data: results, error, loading, refetch: runSql };
}

interface ExecuteSqlOutput {
  results: Results | null;
  errorMessage: string | null;
}

export const executeSql = async (
  environment: Environment | undefined | null,
  sql: string,
  fetcher: FetchAuthedType
): Promise<ExecuteSqlOutput> => {
  const address =
    environment?.resolvable && environment.environmentdHttpsAddress;
  const defaultError = "Error running query.";
  const result: ExecuteSqlOutput = {
    results: null,
    errorMessage: null,
  };
  if (!address || !sql) {
    return result;
  }

  try {
    const response = await fetcher(`//${address}/api/sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql: sql }),
    });

    const responseText = await response.text();

    if (response.status === 400) {
      result.errorMessage = responseText || defaultError;
    } else {
      const parsedResponse = JSON.parse(responseText);
      const { results: responseResults } = parsedResponse;
      const [firstResult] = responseResults;
      // Queries like `CREATE TABLE` or `CREATE CLUSTER` returns a null inside the results array
      const { error: resultsError, rows, col_names } = firstResult || {};

      if (resultsError) {
        result.errorMessage = resultsError;
      } else {
        result.results = {
          rows: rows,
          columns: col_names,
        };
        result.errorMessage = null;
      }
    }
  } catch (err) {
    console.error(err);
    result.errorMessage = defaultError;
  }
  return result;
};

/**
 * useSql hook for a particular environment coordinator address.
 * @param sql
 * @param environment
 * @returns
 */
export function useSqlOnCoordinator(
  sql: string | undefined,
  environment: Environment | null | undefined
) {
  return useSqlInternal(sql, environment);
}

/**
 * A React hook that runs a SQL query against the current environment.
 * @params {string} sql to execute in the environment coord or current global coord.
 * @params {object} extraParams in case a particular environment needs to be used rather than the global environment (global coord)
 */
export function useSql(sql: string | undefined) {
  const [current, _] = useRecoilState(currentEnvironment);
  return useSqlInternal(sql, current?.env);
}

export interface Cluster {
  id: string;
  name: string;
}

/**
 * Fetches all clusters in the current environment.
 */
export function useClusters() {
  const { data, refetch } = useSql(
    "SELECT id, name FROM mz_clusters ORDER BY id"
  );

  let clusters = null;
  if (data) {
    const { rows } = data;

    clusters = rows.map(
      (row) =>
        ({
          id: row[0],
          name: row[1],
        } as Cluster)
    );
  }

  return { clusters, refetch };
}
