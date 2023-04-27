/**
 * @module
 * materialized SQL API.
 */

import React from "react";
import { useEffect, useState } from "react";
import { useRecoilValue_TRANSITION_SUPPORT_UNSTABLE } from "recoil";

import { useAuth } from "~/api/auth";
import executeSql, { Results, SqlRequest } from "~/api/materialize/executeSql";
import { currentEnvironmentState } from "~/recoil/environments";
import { assert } from "~/util";

import { DEFAULT_QUERY_ERROR, quoteIdentifier } from "./materialize";

export * from "./materialize/executeSql";
export { default as executeSql } from "./materialize/executeSql";

export type onSuccess = (data?: Results[] | null) => void;
export type onError = (error?: string) => void;

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

export function genMzIntrospectionSqlRequest(sql?: string) {
  return sql
    ? // Run all queries on the `mz_introspection` cluster, as it's
      // guaranteed to exist. (The `default` cluster may have been dropped
      // by the user.)
      {
        queries: [{ query: sql, params: [] }],
        cluster: "mz_introspection",
      }
    : undefined;
}

/**
 * A React hook that runs a SQL query against the current environment.
 * Runs all queries on the `mz_introspection` cluster.
 * @param sql - SQL query string to execute in the environment.
 */
export function useSql(sql?: string) {
  const request = React.useMemo(() => genMzIntrospectionSqlRequest(sql), [sql]);
  const inner = useSqlMany(request);

  const data = inner.data ? inner.data[0] : null;
  return { ...inner, data };
}

/**
 * A React hook that exposes a handler to run a SQL query against the current environment.
 * @param queryBuilder - A function that takes variables and outputs an SQL query string
 */
export function useSqlLazy<TVariables>({
  queryBuilder,
  onSuccess,
  onError,
}: {
  queryBuilder: (variables: TVariables) => string | SqlRequest;
  onSuccess?: onSuccess;
  onError?: onError;
}) {
  const { runSql: runSqlInner, data, error, loading } = useSqlApiRequest();

  const runSql = React.useCallback(
    (
      variables: TVariables,
      options?: { onSuccess?: onSuccess; onError?: onError }
    ) => {
      const queryOrQueries = queryBuilder(variables);
      if (typeof queryOrQueries === "string") {
        const request = genMzIntrospectionSqlRequest(queryOrQueries);
        runSqlInner(
          request,
          options?.onSuccess ?? onSuccess,
          options?.onError ?? onError
        );
      } else {
        runSqlInner(
          queryOrQueries,
          options?.onSuccess ?? onSuccess,
          options?.onError ?? onError
        );
      }
    },
    [queryBuilder, runSqlInner, onSuccess, onError]
  );

  return { data, error, loading, runSql };
}

/**
 * A React hook that runs possibly several SQL queries
 * (in one request) against the current environment.
 * @param request - SQL request to execute in the environment coord or current global coord.
 */
export function useSqlMany(request?: SqlRequest) {
  const { abortRequest, runSql, ...inner } = useSqlApiRequest();
  // If the sql query changes, execute a new query and abort the previous query.
  useEffect(() => {
    runSql(request);

    return () => {
      abortRequest();
    };
  }, [request, runSql, abortRequest]);

  const refetch = React.useCallback(() => runSql(request), [request, runSql]);

  const isError = inner.error !== null;

  // When no data has been loaded and query is currently fetching
  const isInitiallyLoading = !isError && inner.data === null;

  return { ...inner, refetch, isInitiallyLoading, isError };
}

/**
 * A React hook that connects SQL API requests to React's lifecycle.
 * It keeps track of the state of the request and exposes a handler to execute a SQL query.
 */
export function useSqlApiRequest() {
  const { user } = useAuth();
  const environment = useRecoilValue_TRANSITION_SUPPORT_UNSTABLE(
    currentEnvironmentState
  );
  const [loading, setLoading] = useState<boolean>(false);
  const requestIdRef = React.useRef(1);
  const controllerRef = React.useRef<AbortController>(new AbortController());
  const [results, setResults] = useState<Results[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runSql = React.useCallback(
    async (request?: SqlRequest, onSuccess?: onSuccess, onError?: onError) => {
      if (environment?.state !== "enabled" || !request) {
        setResults(null);
        return;
      }

      controllerRef.current = new AbortController();
      const timeout = setTimeout(() => controllerRef.current.abort(), 5_000);
      const requestId = requestIdRef.current;
      try {
        setLoading(true);
        const result = await executeSql(
          environment,
          request,
          user.accessToken,
          { signal: controllerRef.current.signal }
        );
        if (requestIdRef.current > requestId) {
          // a new query has been kicked off, ignore these results
          return;
        }
        if ("errorMessage" in result) {
          onError?.(result.errorMessage);
          setResults(null);
          setError(result.errorMessage);
        } else {
          onSuccess?.(result.results);
          setResults(result.results);
          setError(null);
        }
      } catch (err) {
        if ((err as Error)?.name === "AbortError") {
          return;
        }

        setError(DEFAULT_QUERY_ERROR);
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    },
    [environment, user.accessToken]
  );

  const abortRequest = React.useCallback(() => {
    requestIdRef.current += 1;
    controllerRef.current.abort();
  }, []);

  return { data: results, error, loading, runSql, abortRequest };
}

export interface ClusterReplicaWithUtilizaton {
  id: string;
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
      // TODO Make this just `string` once Materialize 0.49 is released.
      const replica_id = getColumnByName(row, "id") as number | string;
      const replica: ClusterReplicaWithUtilizaton = {
        id: replica_id.toString(),
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

export function extractData<DataType>(
  data: Results,
  f: (extractor: (colName: string) => any) => DataType
): DataType[] {
  const { rows, getColumnByName } = data;
  assert(getColumnByName);
  return rows.map((row) => f((colName) => getColumnByName(row, colName)));
}

export interface GroupedError {
  error: string;
  lastOccurred: Date;
  count: number;
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
    errors = extractData(result.data, (x) => ({
      lastOccurred: new Date(parseInt(x("last_occurred"))),
      error: x("error"),
      count: x("count"),
    }));
  }

  return { ...result, data: errors };
}

export interface TimestampedCounts {
  count: number;
  timestamp: number;
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
    statuses = extractData(result.data, (x) => ({
      count: x("count") as number,
      timestamp: parseInt(x("bin_start")),
    }));
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
export function useSinks({
  databaseId,
  schemaId,
  nameFilter,
}: { databaseId?: string; schemaId?: string; nameFilter?: string } = {}) {
  // Note: we CAST d.id and sc.id to text because in v0.52 we changed the database ids and schema
  // ids to be strings, namespaced on either System or User.
  const sinkResponse =
    useSql(`SELECT s.id, d.name as database_name, sc.name as schema_name, s.name, s.type, s.size, st.status, st.error
FROM mz_sinks s
INNER JOIN mz_schemas sc ON sc.id = s.schema_id
INNER JOIN mz_databases d ON d.id = sc.database_id
LEFT OUTER JOIN mz_internal.mz_sink_statuses st
ON st.id = s.id
WHERE s.id LIKE 'u%'
${databaseId ? `AND CAST(d.id as text) = '${databaseId}'` : ""}
${schemaId ? `AND CAST(sc.id as text) = '${schemaId}'` : ""}
${nameFilter ? `AND s.name LIKE '%${nameFilter}%'` : ""};`);
  let sinks: Sink[] | null = null;
  if (sinkResponse.data) {
    sinks = extractData(sinkResponse.data, (x) => ({
      id: x("id"),
      name: x("name"),
      schemaName: x("schema_name"),
      databaseName: x("database_name"),
      type: x("type"),
      size: x("size"),
      status: x("status"),
      error: x("error"),
    }));
  }

  const getSinkById = (sinkId?: string) =>
    sinks?.find((s) => s.id == sinkId) ?? null;

  return { ...sinkResponse, data: sinks, getSinkById };
}

export type SinksResponse = ReturnType<typeof useSinks>;

type DDLNoun = "SINK" | "SOURCE";

/**
 * Fetches the DDL statement for creating a schema object
 */
export function useShowCreate(noun: DDLNoun, schemaObject?: SchemaObject) {
  const name = schemaObject
    ? `${quoteIdentifier(schemaObject.databaseName)}.${quoteIdentifier(
        schemaObject.schemaName
      )}.${quoteIdentifier(schemaObject.name)}`
    : undefined;

  const response = useSql(
    schemaObject ? `SHOW CREATE ${noun} ${name}` : undefined
  );
  let ddl: string | null = null;
  if (schemaObject && response.data) {
    const { rows, getColumnByName } = response.data;
    assert(getColumnByName);

    ddl = getColumnByName(rows[0], "create_sql");
  }

  return { ...response, ddl };
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
    views = extractData(response.data, (x) => ({
      id: x("id"),
      name: x("name"),
      definition: x("definition"),
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
    indexes = extractData(response.data, (x) => ({
      id: x("id"),
      name: x("name"),
      relationName: x("relation_name"),
      relationType: x("type"),
    }));
  }

  return { ...response, data: indexes };
}

export interface Secret {
  id: string;
  name: string;
  createdAt: Date;
  databaseName: string;
  schemaName: string;
}

/**
 * Fetches all secrets in the current environment
 */
export function useSecrets({
  databaseId,
  schemaId,
  nameFilter,
}: { databaseId?: string; schemaId?: string; nameFilter?: string } = {}) {
  // Note: we CAST d.id and sc.id to text because in v0.52 we changed the database ids and schema
  // ids to be strings, namespaced on either System or User.
  const secretResponse = useSql(`
  SELECT 
    s.id, 
    s.name, 
    events.occurred_at as created_at,
    d.name as database_name, 
    sc.name as schema_name
  FROM mz_secrets s
  INNER JOIN mz_audit_events events ON events.details->>'id' = s.id
    AND event_type='create' AND object_type='secret'
  INNER JOIN mz_schemas sc ON sc.id = s.schema_id
  INNER JOIN mz_databases d ON d.id = sc.database_id
    ${databaseId ? `AND CAST(d.id as text) = '${databaseId}'` : ""}
    ${schemaId ? `AND CAST(sc.id as text) = '${schemaId}'` : ""}
    ${nameFilter ? `AND s.name LIKE '%${nameFilter}%'` : ""}
  ORDER BY created_at DESC;
  `);
  let secrets: Secret[] | null = null;
  if (secretResponse.data) {
    const { rows, getColumnByName } = secretResponse.data;
    assert(getColumnByName);

    secrets = rows.map((row) => ({
      id: getColumnByName(row, "id"),
      name: getColumnByName(row, "name"),
      createdAt: new Date(parseInt(getColumnByName(row, "created_at"))),
      databaseName: getColumnByName(row, "database_name"),
      schemaName: getColumnByName(row, "schema_name"),
    }));
  }

  return { ...secretResponse, data: secrets };
}
