/**
 * @module
 * materialized SQL API.
 */

import React from "react";
import { useEffect, useMemo, useState } from "react";
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
  getColumnByName?: <R, V>(row: R[], name: string) => V;
}

export interface ExplainTimestampResult {
  determination: {
    timestamp_context: { TimelineTimestamp: Array<number | string> };
    since: { elements: number[] };
    upper: { elements: number[] };
    largest_not_in_advance_of_upper: number;
    oracle_read_ts: number;
  };
  sources: {
    name: string;
    read_frontier: number[];
    write_frontier: number[];
  }[];
}

/**
 * Quotes a string to be used as a SQL identifier.
 * It is an error to call this function with a string that contains the zero code point.
 */
export function quoteIdentifier(id: string) {
  // According to https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS,
  // any string may be used as an identifier, except those that contain the zero code point.
  //
  // In order to support special characters, quoted identifiers must be used.
  // Within a quoted identifier, the literal double-quote character must be escaped
  // by writing it twice.
  // For example, the identifier foo" is represented as "foo""" (including the quotes).

  // Materialize never allows any identifiers to be used whose name contains the null byte,
  // so this assert should never fire unless this function is called with arbitrary user input.
  assert(id.search("\0") === -1);

  return `"${id.replace('"', '""')}"`;
}

/**
 * A React hook that runs a SQL query against the current environment,
 * in the `mz_introspection` cluster.
 * @params {string[]} queries to execute in the environment.
 */
export function useSql(sql: string | undefined) {
  const request = useMemo(
    () =>
      sql
        ? // Run all queries on the `mz_introspection` cluster, as it's
          // guaranteed to exist. (The `default` cluster may have been dropped
          // by the user.)
          {
            queries: [{ query: sql, params: [] }],
            cluster: "mz_introspection",
          }
        : undefined,
    [sql]
  );
  const inner = useSqlMany(request);
  // The first result is the empty "ok" for the `SET` command;
  // we want the second.
  const data = inner.data ? inner.data[1] : null;
  return { ...inner, data };
}

export interface SqlStatement {
  query: string;
  params: (string | null)[];
}

export interface SqlRequest {
  queries: SqlStatement[];
  cluster: string;
  replica?: string;
}

/**
 * A React hook that runs possibly several SQL queries
 * (in one request) against the current environment.
 * @params {string} sql to execute in the environment coord or current global coord.
 */
export function useSqlMany(request: SqlRequest | undefined) {
  const { user } = useAuth();
  const environment = useRecoilValue_TRANSITION_SUPPORT_UNSTABLE(
    currentEnvironmentState
  );
  const [loading, setLoading] = useState<boolean>(false);
  const requestIdRef = React.useRef(1);
  const controllerRef = React.useRef<AbortController>(new AbortController());
  const [results, setResults] = useState<Results[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const defaultError = "Error running query.";

  const runSql = React.useCallback(async () => {
    if (environment?.state !== "enabled" || !request) {
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
        request,
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
  }, [environment, request, user.accessToken]);

  useEffect(() => {
    requestIdRef.current += 1;
    controllerRef.current.abort();
    runSql();
  }, [runSql]);

  return { data: results, error, loading, refetch: runSql };
}

interface ExecuteSqlOutput {
  results: Results[] | null;
  errorMessage: string | null;
}

export const executeSql = async (
  environment: EnabledEnvironment,
  request: SqlRequest,
  accessToken: string,
  requestOpts?: RequestInit
): Promise<ExecuteSqlOutput> => {
  assert(environment.resolvable);

  const address = environment.environmentdHttpsAddress;
  const defaultError = "Error running query.";
  if (!address) {
    return { results: null, errorMessage: null };
  }

  const queries: SqlStatement[] = [
    { query: `SET cluster=${request.cluster}`, params: [] },
  ];
  if (request.replica) {
    queries.push({
      query: `SET cluster_replica=${request.replica}`,
      params: [],
    });
  }
  queries.push(...request.queries);

  const response = await fetch(
    `${config.environmentdScheme}://${address}/api/sql`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        queries: queries,
      }),
      ...requestOpts,
    }
  );

  const responseText = await response.text();

  if (!response.ok) {
    return {
      errorMessage: `HTTP Error ${response.status}: ${
        responseText ?? defaultError
      }`,
      results: null,
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
        return { results: null, errorMessage: resultsError };
      } else {
        outResults.push({
          rows: rows,
          columns: col_names,
          getColumnByName,
        });
      }
    }
    return { errorMessage: null, results: outResults };
  }
};

export interface Cluster {
  id: string;
  name: string;
  replicas: Replica[];
}

export interface Replica {
  id: number;
  name: string;
  size: string;
  clusterName: string;
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
    c.name as cluster_name
  FROM mz_cluster_replicas r
  JOIN mz_clusters c ON c.id = r.cluster_id
  ORDER BY r.id;`
  );

  const clusterMap: Map<string, Cluster> = new Map();
  if (response.data) {
    const { getColumnByName } = response.data;
    assert(getColumnByName);

    response.data.rows.forEach((row) => {
      const clusterId = getColumnByName(row, "cluster_id") as string;
      const clusterName = getColumnByName(row, "cluster_name") as string;
      const replica: Replica = {
        id: getColumnByName(row, "id") as number,
        name: getColumnByName(row, "replica_name") as string,
        size: getColumnByName(row, "size") as string,
        clusterName: clusterName,
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

export interface ClusterReplicaWithUtilizaton {
  id: number;
  name: string;
  size: string;
  memoryPercent?: number;
}

export function useClusterReplicasWithUtilization(clusterId?: string) {
  const response = useSql(
    clusterId
      ? `SELECT r.id,
  r.name as replica_name,
  r.cluster_id,
  r.size,
  u.memory_percent
FROM mz_cluster_replicas r
JOIN mz_internal.mz_cluster_replica_utilization u ON u.replica_id = r.id
WHERE r.cluster_id = '${clusterId}'
ORDER BY r.id;`
      : undefined
  );

  let data: ClusterReplicaWithUtilizaton[] | null = null;
  if (response.data) {
    const { getColumnByName } = response.data;
    assert(getColumnByName);

    data = response.data.rows.map((row) => {
      const replica: ClusterReplicaWithUtilizaton = {
        id: getColumnByName(row, "id") as number,
        name: getColumnByName(row, "replica_name") as string,
        size: getColumnByName(row, "size") as string,
        memoryPercent: getColumnByName(row, "memory_percent") as number,
      };
      return replica;
    });
  }

  return {
    ...response,
    data: data,
  };
}

export type ConnectorStatus =
  | "created"
  | "starting"
  | "running"
  | "stalled"
  | "failed"
  | "dropped";

export interface SchemaObject {
  id: string;
  name: string;
  schemaName: string;
  databaseName: string;
}

export interface Source extends SchemaObject {
  type: string;
  size?: string;
  status?: ConnectorStatus;
  error?: string;
}

/**
 * Fetches all sources in the current environment
 */
export function useSources() {
  const sourceResponse =
    useSql(`SELECT s.id, d.name as database_name, sc.name as schema_name, s.name, s.type, s.size, st.status, st.error
FROM mz_sources s
INNER JOIN mz_schemas sc ON sc.id = s.schema_id
INNER JOIN mz_databases d ON d.id = sc.database_id
LEFT OUTER JOIN mz_internal.mz_source_statuses st ON st.id = s.id
WHERE s.id LIKE 'u%'
AND s.type <> 'subsource';`);

  let sources: Source[] | null = null;
  if (sourceResponse.data) {
    const { rows, getColumnByName } = sourceResponse.data;
    assert(getColumnByName);

    sources = rows.map((row) => ({
      id: getColumnByName(row, "id"),
      name: getColumnByName(row, "name"),
      schemaName: getColumnByName(row, "schema_name"),
      databaseName: getColumnByName(row, "database_name"),
      type: getColumnByName(row, "type"),
      size: getColumnByName(row, "size"),
      status: getColumnByName(row, "status"),
      error: getColumnByName(row, "error"),
    }));
  }

  return { ...sourceResponse, data: sources };
}

export interface GroupedError {
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
  let errors: GroupedError[] | null = null;
  if (result.data) {
    const { rows, getColumnByName } = result.data;
    assert(getColumnByName);

    errors = rows.map((row) => ({
      lastOccurred: new Date(parseInt(getColumnByName(row, "last_occurred"))),
      error: getColumnByName(row, "error"),
      count: getColumnByName(row, "count"),
    }));
  }

  return { ...result, data: errors };
}

/**
 * Fetches errors for a specific sink
 */
export function useSinkErrors({
  limit = 20,
  sinkId,
  startTime,
  endTime,
}: {
  limit?: number;
  sinkId?: string;
  startTime: Date;
  endTime: Date;
}) {
  const result = useSql(
    sinkId
      ? `
  SELECT MAX(extract(epoch from h.occurred_at) * 1000) as last_occurred, h.error, COUNT(h.occurred_at)
  FROM mz_internal.mz_sink_status_history h
  WHERE sink_id = '${sinkId}'
  AND error IS NOT NULL
  AND h.occurred_at BETWEEN '${startTime.toISOString()}' AND '${endTime.toISOString()}'
  GROUP BY h.error
  ORDER BY last_occurred DESC
  LIMIT ${limit};`
      : undefined
  );
  let errors: GroupedError[] | null = null;
  if (result.data) {
    const { rows, getColumnByName } = result.data;
    assert(getColumnByName);

    errors = rows.map((row) => ({
      lastOccurred: new Date(parseInt(getColumnByName(row, "last_occurred"))),
      error: getColumnByName(row, "error"),
      count: getColumnByName(row, "count"),
    }));
  }

  return { ...result, data: errors };
}

export interface TimestampedCounts {
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
  let statuses: TimestampedCounts[] | null = null;
  if (result.data) {
    const { rows, getColumnByName } = result.data;
    assert(getColumnByName);

    statuses = rows.map((row) => {
      return {
        count: getColumnByName(row, "count") as number,
        timestamp: parseInt(getColumnByName(row, "bin_start")) as number,
      };
    });
  }

  return { ...result, data: statuses };
}

export function useBucketedSinkErrors({
  sinkId,
  startTime,
  endTime,
  bucketSizeSeconds,
}: {
  limit?: number;
  sinkId?: string;
  startTime: Date;
  endTime: Date;
  bucketSizeSeconds: number;
}) {
  const result = useSql(
    sinkId
      ? `
SELECT
  COUNT(error) count,
  EXTRACT(epoch FROM date_bin(
    interval '${bucketSizeSeconds} seconds', occurred_at, '${startTime.toISOString()}'
    )) * 1000 as bin_start
FROM mz_internal.mz_sink_status_history
WHERE sink_id = '${sinkId}'
AND occurred_at BETWEEN '${startTime.toISOString()}' AND '${endTime.toISOString()}'
GROUP BY bin_start
ORDER BY bin_start DESC;`
      : undefined
  );
  let statuses: TimestampedCounts[] | null = null;
  if (result.data) {
    const { rows, getColumnByName } = result.data;
    assert(getColumnByName);

    statuses = rows.map((row) => {
      return {
        count: getColumnByName(row, "count") as number,
        timestamp: parseInt(getColumnByName(row, "bin_start")) as number,
      };
    });
  }

  return { ...result, data: statuses };
}

export interface Sink extends SchemaObject {
  type: string;
  size?: string;
  status?: ConnectorStatus;
  error?: string;
}

/**
 * Fetches all sinks in the current environment
 */
export function useSinks() {
  const sinkResponse =
    useSql(`SELECT s.id, d.name as database_name, sc.name as schema_name, s.name, s.type, s.size, st.status, st.error
FROM mz_sinks s
INNER JOIN mz_schemas sc ON sc.id = s.schema_id
INNER JOIN mz_databases d ON d.id = sc.database_id
LEFT OUTER JOIN mz_internal.mz_sink_statuses st
ON st.id = s.id
WHERE s.id LIKE 'u%';
`);
  let sinks: Sink[] | null = null;
  if (sinkResponse.data) {
    const { rows, getColumnByName } = sinkResponse.data;
    assert(getColumnByName);

    sinks = rows.map((row) => ({
      id: getColumnByName(row, "id"),
      name: getColumnByName(row, "name"),
      schemaName: getColumnByName(row, "schema_name"),
      databaseName: getColumnByName(row, "database_name"),
      type: getColumnByName(row, "type"),
      size: getColumnByName(row, "size"),
      status: getColumnByName(row, "status"),
      error: getColumnByName(row, "error"),
    }));
  }

  return { ...sinkResponse, data: sinks };
}

type DDLNoun = "SINK" | "SOURCE";

/**
 * Fetches DDL for a noun
 */
export function useDDL(noun: DDLNoun, objectName?: string) {
  const { data, error, refetch } = useSql(
    objectName
      ? `SHOW CREATE ${noun} ${quoteIdentifier(objectName)}`
      : undefined
  );
  let ddl: string | null = null;
  if (objectName && data) {
    const { rows, getColumnByName } = data;
    assert(getColumnByName);

    ddl = getColumnByName(rows[0], "create_sql");
  }

  return { ddl, error, refetch };
}

export interface MaterializedView {
  id: string;
  name: string;
  definition: string;
}

/**
 * Fetches all materialized views for a given cluster
 */
export function useMaterializedViews(clusterId?: string) {
  const response = useSql(
    clusterId
      ? `SELECT id, name, definition
FROM mz_materialized_views
WHERE cluster_id = '${clusterId}';`
      : undefined
  );
  let views: MaterializedView[] | null = null;
  if (response.data) {
    const { rows, getColumnByName } = response.data;
    assert(getColumnByName);

    views = rows.map((row) => ({
      id: getColumnByName(row, "id"),
      name: getColumnByName(row, "name"),
      definition: getColumnByName(row, "definition"),
    }));
  }

  return { ...response, data: views };
}

export interface Index {
  id: string;
  name: string;
  relationName: string;
  relationType: string;
}

/**
 * Fetches all indexes for a given cluster
 */
export function useIndexes(clusterId?: string) {
  const response = useSql(
    clusterId
      ? `SELECT i.id, i.name, r.name as relation_name, r.type
FROM mz_indexes i
INNER JOIN mz_relations r on r.id = i.on_id
WHERE cluster_id = '${clusterId}'
AND i.id LIKE 'u%';`
      : undefined
  );
  let indexes: Index[] | null = null;
  if (response.data) {
    const { rows, getColumnByName } = response.data;
    assert(getColumnByName);

    indexes = rows.map((row) => ({
      id: getColumnByName(row, "id"),
      name: getColumnByName(row, "name"),
      relationName: getColumnByName(row, "relation_name"),
      relationType: getColumnByName(row, "type"),
    }));
  }

  return { ...response, data: indexes };
}
