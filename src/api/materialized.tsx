/**
 * @module
 * materialized SQL API.
 */

import React from "react";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

import config from "../config";
import {
  currentEnvironmentState,
  EnabledEnvironment,
} from "../recoil/environments";
import { assert } from "../util";
import { FetchAuthedType, useAuth } from "./auth";

export interface Results {
  columns: Array<string>;
  rows: Array<any>;
}

/**
 * A React hook that runs a SQL query against the current environment.
 * @params {string} sql to execute in the environment coord or current global coord.
 * @params {object} extraParams in case a particular environment needs to be used rather than the global environment (global coord)
 */
export function useSql(sql: string | undefined) {
  const { fetchAuthed } = useAuth();
  const environment = useRecoilValue(currentEnvironmentState);
  const [loading, setLoading] = useState<boolean>(true);
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState<string | null>(null);
  const defaultError = "Error running query.";

  async function runSql() {
    if (environment.state !== "enabled" || !sql) {
      setResults(null);
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
    runSql();
  }, [environment, sql]);

  return { data: results, error, loading, refetch: runSql };
}

interface ExecuteSqlOutput {
  results: Results | null;
  errorMessage: string | null;
}

export const executeSql = async (
  environment: EnabledEnvironment,
  query: string,
  fetcher: FetchAuthedType,
  requestOpts?: RequestInit
): Promise<ExecuteSqlOutput> => {
  assert(environment.resolvable);

  const address = environment.environmentdHttpsAddress;
  const defaultError = "Error running query.";
  const result: ExecuteSqlOutput = {
    results: null,
    errorMessage: null,
  };
  if (!address || !query) {
    return result;
  }

  try {
    const response = await fetcher(
      `${config.environmentdScheme}://${address}/api/sql`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
        ...requestOpts,
      }
    );

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

export interface Cluster {
  id: string;
  name: string;
  replicas?: Replica[];
}

export interface Replica {
  replica: string;
  size?: string;
  cluster: string;
}

/**
 * Fetches all clusters in the current environment.
 */
export function useClusters() {
  const clusterResponse = useSql(
    "SELECT id, name FROM mz_clusters ORDER BY id"
  );
  const replicaResponse = useSql("SELECT * FROM (SHOW CLUSTER REPLICAS)");

  const replicasByCluster: { [clusterId: string]: Replica[] } = {};
  if (replicaResponse.data) {
    replicaResponse.data.rows.forEach((indexRow: string[]) => {
      const clusterName = indexRow[0];
      const replica: Replica = {
        cluster: indexRow[0],
        replica: indexRow[1],
        size: indexRow[2],
      };
      if (replicasByCluster[clusterName]) {
        replicasByCluster[clusterName] = [
          ...replicasByCluster[clusterName],
          replica,
        ];
      } else {
        replicasByCluster[clusterName] = [replica];
      }
    });
  }

  let clusters = null;
  if (clusterResponse.data) {
    const { rows } = clusterResponse.data;

    clusters = rows.map(
      (row) =>
        ({
          id: row[0],
          name: row[1],
          replicas: replicasByCluster[row[1]],
        } as Cluster)
    );
  }

  const refetch = React.useCallback(() => {
    clusterResponse.refetch();
    replicaResponse.refetch();
  }, [clusterResponse, replicaResponse]);

  return { clusters, refetch };
}
