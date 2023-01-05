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
  }, [runSql]);

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
  replicas: Replica[];
}

export interface Replica {
  replica: string;
  size?: string;
  cluster: string;
  cpuPercent: number;
  memoryPercent: number;
}

/**
 * Fetches all clusters in the current environment.
 */
export function useClusters() {
  const response = useSql(
    `SELECT r.id,
    r.name as replica_name,
    r.cluster_id,
    r.size,
    c.name as cluster_name,
    u.cpu_percent_normalized,
    u.memory_percent
  FROM mz_cluster_replicas r
  JOIN mz_clusters c ON c.id = r.cluster_id
  JOIN mz_internal.mz_cluster_replica_utilization u ON u.replica_id = r.id
  ORDER BY r.id;`
  );

  const clusterMap: Map<string, Cluster> = new Map();
  if (response.data) {
    response.data.rows.forEach((row: string | number[]) => {
      const clusterId = row[2] as string;
      const clusterName = row[4] as string;
      const replica: Replica = {
        replica: row[1] as string,
        size: row[3] as string,
        cluster: clusterName,
        cpuPercent: row[5] as number,
        memoryPercent: row[6] as number,
      };
      const cluster = clusterMap.get(clusterId);
      if (cluster) {
        cluster.replicas.push(replica);
      } else {
        clusterMap.set(clusterId, {
          id: clusterId,
          name: clusterName,
          replicas: [replica],
        });
      }
    });
  }

  return {
    ...response,
    data: response.data ? Array.from(clusterMap.values()) : null,
  };
}

export type ClusterResponse = ReturnType<typeof useClusters>;

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
  error?: string;
}

/**
 * Fetches all sources in the current environment
 */
export function useSources() {
  const sourceResponse =
    useSql(`SELECT s.id, s.oid, s.name, s.type, s.size, st.status, st.error
FROM mz_sources s
LEFT OUTER JOIN mz_internal.mz_source_statuses st
ON st.id = s.id
WHERE s.id LIKE 'u%';
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
      error: row[6],
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
  startTime,
  endTime,
}: {
  limit?: number;
  sourceId?: string;
  startTime: Date;
  endTime: Date;
}) {
  const result = useSql(
    sourceId
      ? `
  SELECT MAX(extract(epoch from h.occurred_at) * 1000) as last_occurred, h.error, COUNT(h.occurred_at)
  FROM mz_internal.mz_source_status_history h
  WHERE source_id = '${sourceId}'
  AND error IS NOT NULL
  AND h.occurred_at BETWEEN '${startTime.toISOString()}' AND '${endTime.toISOString()}'
  GROUP BY h.error
  ORDER BY last_occurred DESC
  LIMIT ${limit};`
      : undefined
  );
  let errors: SourceError[] | null = null;
  if (result.data) {
    const { rows } = result.data;
    errors = rows.map((row) => ({
      lastOccurred: new Date(parseInt(row[0])),
      error: row[1],
      count: row[2],
    }));
  }

  return { ...result, data: errors };
}

export interface SourceErrorBucket {
  count: number;
  timestamp: number;
}

export function useBucketedSourceErrors({
  sourceId,
  startTime,
  endTime,
  bucketSizeSeconds,
}: {
  limit?: number;
  sourceId?: string;
  startTime: Date;
  endTime: Date;
  bucketSizeSeconds: number;
}) {
  const result = useSql(
    sourceId
      ? `
SELECT
  COUNT(error) count,
  EXTRACT(epoch FROM date_bin(
    interval '${bucketSizeSeconds} seconds', occurred_at, '${startTime.toISOString()}'
    )) * 1000 as bin_start
FROM mz_internal.mz_source_status_history
WHERE source_id = '${sourceId}'
AND occurred_at BETWEEN '${startTime.toISOString()}' AND '${endTime.toISOString()}'
GROUP BY bin_start
ORDER BY bin_start DESC;`
      : undefined
  );
  let statuses: SourceErrorBucket[] | null = null;
  if (result.data) {
    const { rows } = result.data;
    statuses = rows.map((row) => {
      return {
        count: row[0] as number,
        timestamp: parseInt(row[1]) as number,
      };
    });
  }

  return { ...result, data: statuses };
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
  const { data, error, refetch } = useSql(
    sinkName ? `SHOW CREATE ${noun} ${sinkName}` : undefined
  );
  let ddl = null;
  if (sinkName && data) {
    const { rows } = data;
    ddl = rows[0][1];
  }

  return { ddl, error, refetch };
}
