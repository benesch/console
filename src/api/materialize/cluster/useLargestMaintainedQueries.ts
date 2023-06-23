import { sql } from "kysely";
import React from "react";

import { useEnvironmentGate } from "~/recoil/environments";

import { isSystemCluster, rawLimit } from "..";
import { queryBuilder } from "../db";
import useSqlTyped from "../useSqlTyped";

export function buildSmallestReplicaQuery(clusterId: string) {
  if (isSystemCluster(clusterId)) {
    return null;
  }
  const qb = queryBuilder
    .selectFrom("mz_catalog.mz_cluster_replicas as cr")
    .innerJoin(
      "mz_internal.mz_cluster_replica_sizes as rs",
      "cr.size",
      "rs.size"
    )
    .select(["cr.name", "rs.memory_bytes as memoryBytes"])
    .where("cr.cluster_id", "=", clusterId)
    // Order by smallest replicas first
    .orderBy("rs.memory_bytes", "desc");

  // take the first (smallest) replica
  return rawLimit(qb, 1).compile();
}

export function buildLargestMaintainedQueriesQuery(
  replicaSize: number | null,
  limit: number,
  isV058: boolean
) {
  if (!replicaSize) return null;

  if (isV058) {
    const qb = queryBuilder
      .selectFrom("mz_internal.mz_dataflow_arrangement_sizes as s")
      .innerJoin(
        "mz_internal.mz_compute_exports as ce",
        "ce.dataflow_id",
        "s.id"
      )
      .innerJoin("mz_catalog.mz_objects as o", "o.id", "ce.export_id")
      .innerJoin("mz_catalog.mz_schemas as sc", "sc.id", "o.schema_id")
      .innerJoin("mz_catalog.mz_databases as da", "da.id", "sc.database_id")
      .select([
        "s.id",
        "s.name",
        sql`${sql.id("s", "size")} / (${sql.raw(replicaSize.toString())})`
          .$castTo<string>()
          .as("memoryPercentage"),
        "o.type",
        "sc.name as schemaName",
        "da.name as databaseName",
      ])
      .orderBy("memoryPercentage", "desc");

    return rawLimit(qb, limit).compile();
  } else {
    const qb = queryBuilder
      .selectFrom("mz_internal.mz_dataflow_arrangement_sizes as s")
      .innerJoin("mz_internal.mz_dataflows as d", "d.id", "s.id")
      .innerJoin(
        "mz_internal.mz_compute_exports as ce",
        "ce.dataflow_id",
        "d.local_id"
      )
      .innerJoin("mz_catalog.mz_objects as o", "o.id", "ce.export_id")
      .innerJoin("mz_catalog.mz_schemas as sc", "sc.id", "o.schema_id")
      .innerJoin("mz_catalog.mz_databases as da", "da.id", "sc.database_id")
      .select([
        "s.id",
        "s.name",
        sql`${sql.id("s", "size")} / (${sql.raw(replicaSize.toString())})`
          .$castTo<string>()
          .as("memoryPercentage"),
        "o.type",
        "sc.name as schemaName",
        "da.name as databaseName",
      ])
      .orderBy("memoryPercentage", "desc");

    return rawLimit(qb, limit).compile();
  }
}

/**
 * Fetches the maintained queries that use the most memory
 *
 * memoryPercent is based on the smallest replica in the cluster
 */
function useLargestMaintainedQueries({
  clusterId,
  clusterName,
}: {
  clusterId: string;
  clusterName: string;
}) {
  const sizeQuery = React.useMemo(
    () => buildSmallestReplicaQuery(clusterId),
    [clusterId]
  );
  const sizeResponse = useSqlTyped(sizeQuery);
  let replicaInfo: { memoryBytes: number; replicaName: string } | null = null;
  if (sizeResponse.results.length > 0) {
    replicaInfo = {
      memoryBytes: parseInt(sizeResponse.results[0].memoryBytes),
      replicaName: sizeResponse.results[0].name,
    };
  }

  // https://github.com/MaterializeInc/materialize/pull/20061
  // This can be removed once v0.58.x is rolled out to all customers
  const isV058 = useEnvironmentGate("0.58.0");
  const query = React.useMemo(
    () =>
      buildLargestMaintainedQueriesQuery(
        replicaInfo?.memoryBytes ?? null,
        10,
        isV058 ?? false
      ),
    [isV058, replicaInfo?.memoryBytes]
  );

  const response = useSqlTyped(query, {
    cluster: clusterName,
    replica: replicaInfo?.replicaName,
    transformRow: (row) => {
      const memoryPercentage = parseFloat(row.memoryPercentage);
      return {
        ...row,
        memoryPercentage:
          memoryPercentage < 0.01 ? "< 1" : memoryPercentage.toFixed(1),
      };
    },
  });

  if (!sizeResponse.loading && sizeResponse.results.length === 0) {
    return { ...sizeResponse, data: [], replicaName: null, results: [] };
  }

  return {
    ...response,
    data: response.results,
    replicaName: replicaInfo?.replicaName,
    error: sizeResponse.error ?? response.error,
    refetch: async () => {
      await sizeResponse.refetch();
      return response.refetch();
    },
  };
}

export type LargestMaintainedQueriesResponse = ReturnType<
  typeof useLargestMaintainedQueries
>;

export type Sink = LargestMaintainedQueriesResponse["data"][0];

export default useLargestMaintainedQueries;
