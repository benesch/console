/**
 * @module
 * materialized SQL API.
 */

import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";

import { currentEnvironment } from "../recoil/currentEnvironment";
import { useAuth } from "./auth";

/**
 * A React hook that runs a SQL query against the current environment.
 */
export function useSql(query: string) {
  const { fetchAuthed } = useAuth();
  const [current, _] = useRecoilState(currentEnvironment);
  const [results, setResults] = useState<any[] | null>(null);

  async function executeQuery() {
    if (!current) return;

    const response = await fetchAuthed(`//${current.address}/sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `sql=${encodeURIComponent(query)}`,
    });
    const results = JSON.parse(await response.text());
    setResults(results.results[0].rows);
  }

  useEffect(() => {
    executeQuery();
  }, [current, query]);

  return { data: results, refetch: executeQuery };
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

  let clusters: Cluster[] = [];
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
