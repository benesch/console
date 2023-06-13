import { sql } from "kysely";
import React from "react";

import { queryBuilder } from "../db";
import useSqlTyped from "../useSqlTyped";

/**
 * Sources and sinks cannot be installed on
 * - system clusters
 * - clusters that also have indexes or materialized views on them
 * - clusters that have more than one replica
 */
export function buildConnectorClustersQuery() {
  return (
    queryBuilder
      .selectFrom("mz_catalog.mz_clusters as c")
      .select(["c.id", "c.name"])
      // system clusters start with `s`
      .where("c.id", "like", "u%")
      .where("c.id", "not in", (qb) =>
        qb
          .selectFrom("mz_catalog.mz_indexes as i")
          .select("cluster_id")
          .where("i.id", "like", "u%")
          .distinct()
      )
      .where("c.id", "not in", (qb) =>
        qb
          .selectFrom("mz_catalog.mz_materialized_views as mv")
          .select("cluster_id")
          .distinct()
      )
      .where("c.id", "not in", (qb) =>
        qb
          .selectFrom("mz_catalog.mz_cluster_replicas as r")
          .select("cluster_id")
          .groupBy("cluster_id")
          .having(() => sql`count(${sql.id("id")}) > 1`)
      )
      .compile()
  );
}
/**
 * Fetches all sources in the current environment
 */
function useConnectorClusters() {
  const query = React.useMemo(() => buildConnectorClustersQuery(), []);

  const response = useSqlTyped(query);

  return { ...response, data: response.results };
}

export type ClusterResponse = ReturnType<typeof useConnectorClusters>;

export type Cluster = ClusterResponse["data"][0];

export default useConnectorClusters;
