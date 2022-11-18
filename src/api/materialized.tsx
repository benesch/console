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
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState<string | null>(null);
  const defaultError = "Error running query.";

  const runSql = React.useCallback(async () => {
    if (environment?.state !== "enabled" || !sql) {
      setResults(null);
      return;
    }

    try {
      setLoading(true);
      const { results: res, errorMessage } = await executeSql(
        environment,
        sql,
        user.accessToken
      );
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
      setLoading(false);
    }
  }, [environment, sql, user.accessToken]);

  useEffect(() => {
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

export interface Source {
  id: string;
  name: string;
  type: string;
  size?: string;
}

/**
 * Fetches all sources in the current environment
 */
export function useSources() {
  const sourceResponse = useSql("SHOW SOURCES");
  let sources = null;
  if (sourceResponse.data) {
    const { rows } = sourceResponse.data;
    sources = rows.map(
      (row) =>
        ({
          id: row[0],
          name: row[0],
          type: row[1],
          size: row[2],
        } as Source)
    );
  }

  const refetch = React.useCallback(() => {
    sourceResponse.refetch();
  }, [sourceResponse]);

  return { sources, refetch };
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
export function useDDL(noun: DDLNoun, sinkName: string) {
  const ddlResponse = useSql(`SHOW CREATE ${noun} ${sinkName}`);
  let ddl = null;
  if (sinkName && ddlResponse.data) {
    const { rows } = ddlResponse.data;
    ddl = rows[0][1];
  }

  const refetch = React.useCallback(() => {
    ddlResponse.refetch();
  }, [ddlResponse]);

  return { ddl, refetch };
}
