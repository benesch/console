/**
 * @module
 * materialized SQL API.
 */

import React from "react";
import { useEffect, useState } from "react";
import { useRecoilValue_TRANSITION_SUPPORT_UNSTABLE } from "recoil";

import { useAuth } from "~/api/auth";
import config from "~/config";
import {
  currentEnvironmentState,
  EnabledEnvironment,
} from "~/recoil/environments";
import { assert } from "~/util";

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
  const { user } = useAuth();
  const environment = useRecoilValue_TRANSITION_SUPPORT_UNSTABLE(
    currentEnvironmentState
  );
  const [loading, setLoading] = useState<boolean>(true);
  const requestIdRef = React.useRef(1);
  const controllerRef = React.useRef<AbortController>(new AbortController());
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState<string | null>(null);
  const defaultError = "Error running query.";

  const runSql = React.useCallback(async () => {
    if (environment?.state !== "enabled" || !sql) {
      setResults(null);
      return;
    }

    controllerRef.current = new AbortController();
    const timeout = setTimeout(() => controllerRef.current.abort(), 5_000);
    const requestId = requestIdRef.current;
    try {
      setLoading(true);
      const { results: res, errorMessage } = await executeSql(
        environment,
        sql,
        user.accessToken,
        { signal: controllerRef.current.signal }
      );
      if (requestIdRef.current > requestId) {
        // a new query has been kicked off, ignore these results
        return;
      }
      if (errorMessage) {
        setResults(null);
        setError(errorMessage);
      } else {
        setResults(res);
        setError(null);
      }
    } catch (err) {
      console.error(err);
      setError(defaultError);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, [environment, sql, user.accessToken]);

  useEffect(() => {
    requestIdRef.current += 1;
    controllerRef.current.abort();
    runSql();
  }, [environment, sql, runSql]);

  return { data: results, error, loading, refetch: runSql };
}

interface ExecuteSqlOutput {
  results: Results | null;
  errorMessage: string | null;
}

export const executeSql = async (
  environment: EnabledEnvironment,
  query: string,
  accessToken: string,
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

  const response = await fetch(
    `${config.environmentdScheme}://${address}/api/sql`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Run all queries on the `mz_introspection` cluster, as it's
        // guaranteed to exist. (The `default` cluster may have been dropped
        // by the user.)
        //
        // TODO: allow the caller of `executeSql` to configure the cluster.
        query: `SET cluster = mz_introspection; ${query}`,
      }),
      ...requestOpts,
    }
  );

  const responseText = await response.text();

  if (!response.ok) {
    result.errorMessage = responseText || defaultError;
  } else {
    const parsedResponse = JSON.parse(responseText);
    const {
      results: [_, data],
    } = parsedResponse;
    // Queries like `CREATE TABLE` or `CREATE CLUSTER` returns a null inside the results array
    const { error: resultsError, rows, col_names } = data || {};

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
  return result;
};

export interface Cluster {
  id: string;
  name: string;
  replicas: {
    value: Replica[];
    loading: boolean;
  };
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
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);

  const replicasByCluster: { [clusterId: string]: Replica[] } = {};
  if (!replicaResponse.loading && isInitialLoad) {
    setIsInitialLoad(false);
  }
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
          replicas: {
            value: replicasByCluster[row[1]] ?? [],
            loading: isInitialLoad,
          },
        } as Cluster)
    );
  }

  const refetch = React.useCallback(() => {
    clusterResponse.refetch();
    replicaResponse.refetch();
  }, [clusterResponse, replicaResponse]);

  return { clusters, refetch };
}

export type SourceStatus =
  | "created"
  | "starting"
  | "running"
  | "stalled"
  | "failed"
  | "dropped";

export interface Source {
  id: string;
  oid: number;
  name: string;
  type: string;
  size?: string;
  status?: SourceStatus;
}

/**
 * Fetches all sources in the current environment
 */
export function useSources() {
  const sourceResponse = useSql(`SELECT s.id, s.oid, s.name, s.type, s.size,
  (
    SELECT status
    FROM mz_internal.mz_source_status_history h
    WHERE h.source_id = s.id
    ORDER BY occurred_at DESC
    LIMIT 1
  ) status
FROM mz_sources s
WHERE id LIKE 'u%';
`);
  let sources: Source[] | null = null;
  if (sourceResponse.data) {
    const { rows } = sourceResponse.data;
    sources = rows.map((row) => ({
      id: row[0],
      oid: row[1],
      name: row[2],
      type: row[3],
      size: row[4],
      status: row[5],
    }));
  }

  const refetch = React.useCallback(() => {
    sourceResponse.refetch();
  }, [sourceResponse]);

  return { sources, refetch };
}

export interface SourceError {
  error: string;
  lastOccurred: Date;
  count: number;
}

/**
 * Fetches errors for a specific source
 */
export function useSourceErrors({
  limit = 20,
  sourceId,
}: {
  limit?: number;
  sourceId?: string;
}) {
  const result = useSql(
    sourceId
      ? `
  SELECT MAX(extract(epoch from h.occurred_at) * 1000) as last_occurred, h.error, COUNT(h.occurred_at)
  FROM mz_internal.mz_source_status_history h
  WHERE source_id = '${sourceId}'
  AND error IS NOT NULL
  GROUP BY h.error
  ORDER BY last_occurred DESC
  LIMIT ${limit};`
      : undefined
  );
  let errors: SourceError[] | null = null;
  if (result.data) {
    const { rows } = result.data;
    errors = rows.map((row) => ({
      lastOccurred: new Date(row[0]),
      error: row[1],
      count: row[2],
    }));
  }

  const refetch = React.useCallback(() => {
    result.refetch();
  }, [result]);

  return { errors, refetch };
}

export interface Sink {
  id: string;
  name: string;
  type: string;
  size?: string;
}

/**
 * Fetches all sinks in the current environment
 */
export function useSinks() {
  const sinkResponse = useSql("SHOW SINKS");
  let sinks = null;
  if (sinkResponse.data) {
    const { rows } = sinkResponse.data;
    sinks = rows.map(
      (row) =>
        ({
          id: row[0],
          name: row[0],
          type: row[1],
          size: row[2],
        } as Sink)
    );
  }

  const refetch = React.useCallback(() => {
    sinkResponse.refetch();
  }, [sinkResponse]);

  return { sinks, refetch };
}

type DDLNoun = "SINK" | "SOURCE";

/**
 * Fetches DDL for a noun
 */
export function useDDL(noun: DDLNoun, sinkName?: string) {
  const { data, refetch } = useSql(
    sinkName ? `SHOW CREATE ${noun} ${sinkName}` : undefined
  );
  let ddl = null;
  if (sinkName && data) {
    const { rows } = data;
    ddl = rows[0][1];
  }

  return { ddl, refetch };
}
