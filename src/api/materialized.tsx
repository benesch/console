/**
 * @module
 * materialized SQL API.
 */

import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";

import { currentEnvironment } from "../recoil/currentEnvironment";
import { useAuth } from "./auth";

interface Results {
  columns: Array<string>;
  rows: Array<any>;
}

/**
 * A React hook that runs a SQL query against the current environment.
 */
export function useSql(sql: string | undefined) {
  const { fetchAuthed } = useAuth();
  const [current, _] = useRecoilState(currentEnvironment);
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * _Current_ variable can be a value not available
   */
  async function executeSql() {
    if (!current || !sql) return;

    try {
      setLoading(true);

      const response = await fetchAuthed(`//${current.address}/api/sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql: sql }),
      });
      const parsedResponse = JSON.parse(await response.text());
      const { results: responseResults } = parsedResponse;
      const [firstResult] = responseResults;
      const { error: resultsError, rows, col_names } = firstResult;

      if (resultsError) {
        setError(resultsError);
      } else {
        setResults({
          rows: rows,
          columns: col_names,
        });
        setError(null);
      }
    } catch (err) {
      console.error(err);
      setError("Error running query.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    executeSql();
  }, [current, sql]);

  return { data: results, error, loading, refetch: executeSql };
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
