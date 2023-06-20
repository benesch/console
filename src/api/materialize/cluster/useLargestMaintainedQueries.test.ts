import { assert } from "~/util";

import {
  buildLargestMaintainedQueriesQuery,
  buildSmallestReplicaQuery,
} from "./useLargestMaintainedQueries";

describe("buildSmallestReplicaQuery", () => {
  it("produces the expected query", () => {
    const query = buildSmallestReplicaQuery("u1");
    assert(query);
    expect(query.parameters).toEqual(["u1"]);
    expect(query.sql).toEqual(
      'select "cr"."name", "rs"."memory_bytes" as "memoryBytes" from "mz_catalog"."mz_cluster_replicas" as "cr" inner join "mz_internal"."mz_cluster_replica_sizes" as "rs" on "cr"."size" = "rs"."size" where "cr"."cluster_id" = $1 order by "rs"."memory_bytes" desc limit 1'
    );
  });

  it("returns null for system clusters", () => {
    const query = buildSmallestReplicaQuery("s1");
    expect(query).toBeNull();
  });
});

describe("buildLargestMaintainedQueriesQuery", () => {
  it("produces the expected query", () => {
    const query = buildLargestMaintainedQueriesQuery(17179869184, 10);
    assert(query);
    expect(query.sql).toEqual(
      'select "s"."id", "s"."name", "s"."size" / (17179869184) as "memoryPercentage", "o"."type", "sc"."name" as "schemaName", "da"."name" as "databaseName" from "mz_internal"."mz_dataflow_arrangement_sizes" as "s" inner join "mz_internal"."mz_dataflows" as "d" on "d"."id" = "s"."id" inner join "mz_internal"."mz_compute_exports" as "ce" on "ce"."dataflow_id" = "d"."local_id" inner join "mz_catalog"."mz_objects" as "o" on "o"."id" = "ce"."export_id" inner join "mz_catalog"."mz_schemas" as "sc" on "sc"."id" = "o"."schema_id" inner join "mz_catalog"."mz_databases" as "da" on "da"."id" = "sc"."database_id" order by "memoryPercentage" desc limit 10'
    );
  });
});
