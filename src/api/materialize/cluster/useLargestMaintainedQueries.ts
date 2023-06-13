import { sql } from "kysely";
import React from "react";

import { rawLimit } from "..";
import { queryBuilder } from "../db";
import useSqlTyped from "../useSqlTyped";

export function buildLargestMaintainedQueriesQuery(
  clusterId: string,
  limit: number
) {
  const qb = queryBuilder
    .selectFrom("mz_internal.mz_dataflow_arrangement_sizes as s")
    .select(["s.id", "s.name"])
    .select((eb) =>
      sql`${sql.id("s", "size")} / (${rawLimit(
        eb
          .selectFrom("mz_catalog.mz_cluster_replicas as cr")
          .innerJoin(
            "mz_internal.mz_cluster_replica_sizes as rs",
            "cr.size",
            "rs.size"
          )
          .select("rs.memory_bytes")
          .where("cr.cluster_id", "=", clusterId)
          // Take the smallest replica
          .orderBy("rs.memory_bytes", "desc"),
        1
      )}) * 100 `
        .$castTo<string>()
        .as("memoryPercentage")
    )
    .innerJoin("mz_internal.mz_dataflows as d", "d.id", "s.id")
    .innerJoin(
      "mz_internal.mz_compute_exports as ce",
      "ce.dataflow_id",
      "d.local_id"
    )
    .innerJoin("mz_catalog.mz_objects as o", "o.id", "ce.export_id")
    .select("o.type")
    .innerJoin("mz_catalog.mz_schemas as sc", "sc.id", "o.schema_id")
    .select("sc.name as schemaName")
    .innerJoin("mz_catalog.mz_databases as da", "da.id", "sc.database_id")
    .select("da.name as databaseName")
    .orderBy("memoryPercentage", "desc");

  return rawLimit(qb, limit).compile();
}

/**
 * Fetches the maintained queries that use the most memory
 *
 * memoryPercent is based on the smallest replica in the cluster
 */
function useLargestMaintainedQueries({
  clusterId,
  clusterName,
  replicaName,
}: {
  clusterId: string;
  clusterName: string;
  replicaName: string;
}) {
  const query = React.useMemo(
    () => buildLargestMaintainedQueriesQuery(clusterId, 10),
    [clusterId]
  );

  const response = useSqlTyped(query, {
    cluster: clusterName,
    replica: replicaName,
    transformRow: (row) => {
      const memoryPercentage = parseFloat(row.memoryPercentage);
      return {
        ...row,
        memoryPercentage:
          memoryPercentage < 0.01 ? "< 1" : memoryPercentage.toFixed(1),
      };
    },
  });

  return { ...response, data: response.results };
}

export type LargestMaintainedQueriesResponse = ReturnType<
  typeof useLargestMaintainedQueries
>;

export type Sink = LargestMaintainedQueriesResponse["data"][0];

export default useLargestMaintainedQueries;
