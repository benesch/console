/**
 * @module
 * materialized SQL API.
 */

import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";

import { currentEnvironment } from "../recoil/environments";
import { useAuth } from "./auth";
import { Environment } from "./environment-controller";

interface Results {
  columns: Array<string>;
  rows: Array<any>;
}

/**
 * useSql hook state implementation
 * @param sql
 * @param address
 * @returns
 */
function useSqlInternal(
  sql: string | undefined,
  address: string | undefined | null
) {
  const { fetchAuthed } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState<string | null>(null);
  const defaultError = "Error running query.";

  async function executeSql() {
    if (!address || !sql) {
      setResults(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await fetchAuthed(`//${address}/api/sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql: sql }),
      });

      const responseText = await response.text();

      if (response.status === 400) {
        setResults(null);
        setError(responseText || defaultError);
      } else {
        const parsedResponse = JSON.parse(responseText);
        const { results: responseResults } = parsedResponse;
        const [firstResult] = responseResults;
        // Queries like `CREATE TABLE` or `CREATE CLUSTER` returns a null inside the results array
        const { error: resultsError, rows, col_names } = firstResult || {};

        if (resultsError) {
          setError(resultsError);
          setResults(null);
        } else {
          setResults({
            rows: rows,
            columns: col_names,
          });
          setError(null);
        }
      }
    } catch (err) {
      console.error(err);
      setError(defaultError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // If either the location or the query changed, past results aren't valid anymore.
    setResults(null);
    executeSql();
  }, [address, sql]);

  return { data: results, error, loading, refetch: executeSql };
}

/**
 * useSql hook for a particular environment coordinator address.
 * @param sql
 * @param environment
 * @returns
 */
export function useSqlOnCoordinator(
  sql: string | undefined,
  environment: Environment | null
) {
  return useSqlInternal(
    sql,
    environment && environment.environmentdHttpsAddress
  );
}

/**
 * A React hook that runs a SQL query against the current environment.
 * @params {string} sql to execute in the environment coord or current global coord.
 * @params {object} extraParams in case a particular environment needs to be used rather than the global environment (global coord)
 */
export function useSql(sql: string | undefined) {
  const [current, _] = useRecoilState(currentEnvironment);
  return useSqlInternal(sql, current && current.env?.environmentdHttpsAddress);
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
