import { buildConnectorClustersQuery } from "./useConnectorClusters";

describe("buildConnectorClustersQuery", () => {
  it("produces the expected query", () => {
    const query = buildConnectorClustersQuery();
    expect(query.parameters).toEqual(["u%", "u%"]);
    expect(query.sql).toEqual(
      'select "c"."id", "c"."name" from "mz_catalog"."mz_clusters" as "c" where "c"."id" like $1 and "c"."id" not in (select distinct "cluster_id" from "mz_catalog"."mz_indexes" as "i" where "i"."id" like $2) and "c"."id" not in (select distinct "cluster_id" from "mz_catalog"."mz_materialized_views" as "mv") and "c"."id" not in (select "cluster_id" from "mz_catalog"."mz_cluster_replicas" as "r" group by "cluster_id" having count("id") > 1)'
    );
  });
});
