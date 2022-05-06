/**
 * @module
 * materialized SQL API.
 */

import { useEffect, useState } from "react";

import { useAuth } from "./auth";
import { useEnvironments } from "./environment-controller-fetch";

/**
 * A React hook that runs a SQL query against the current environment.
 */
export function useSql(sql: string) {
  const { fetchAuthed } = useAuth();
  const { current } = useEnvironments();
  const [results, setResults] = useState<any[] | null>(null);

  /**
   * _Current_ variable can be a value not available
   */
  async function executeSql() {
    if (!current) return;

    try {
      const response = await fetchAuthed(`//${current.address}/api/sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql: sql }),
      });
      const results = JSON.parse(await response.text());
      setResults(results.results[0].rows);
    } catch (err) {
      console.error("Error running SQL: ", err);
      setResults(null);
    }
  }

  useEffect(() => {
    executeSql();
  }, [current, sql]);

  return { data: results, refetch: executeSql };
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
    clusters = data.map(
      (row) =>
        ({
          id: row[0],
          name: row[1],
        } as Cluster)
    );
  }

  return { clusters, refetch };
}
