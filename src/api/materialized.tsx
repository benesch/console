/**
 * @module
 * materialized SQL API.
 */

import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";

import {
  currentEnvironment,
  RegionEnvironment,
} from "../recoil/currentEnvironment";
import { useAuth } from "./auth";
import { Environment } from "./environment-controller";

interface Results {
  columns: Array<string>;
  rows: Array<any>;
}

interface ExtraParams {
  environment: Environment | null;
}

/**
 * A React hook that runs a SQL query against the current environment.
 * @params {string} sql to execute in the environment coord or current global coord.
 * @params {object} extraParams in case a particular environment needs to be used rather than the global environment (global coord)
 */
export function useSql(sql: string | undefined, extraParams?: ExtraParams) {
  const { fetchAuthed } = useAuth();
  const [current, _] = useRecoilState(currentEnvironment);
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * _Current_ variable can be a value not available
   */
  async function executeSql() {
    const address = extraParams
      ? extraParams.environment && extraParams.environment.coordd_address
      : current && current.address;

    if (!address || !sql) {
      setResults(null);
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
      const parsedResponse = JSON.parse(await response.text());
      const { results: responseResults } = parsedResponse;
      const [firstResult] = responseResults;
      const { error: resultsError, rows, col_names } = firstResult;

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
    } catch (err) {
      console.error(err);
      setError("Error running query.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    executeSql();
  }, [current, extraParams, sql]);

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
