import { buildSinkErrorsQuery } from "./useSinkErrors";

describe("buildConnectorClustersQuery", () => {
  it("produces the expected query", () => {
    const query = buildSinkErrorsQuery(
      "u1",
      new Date("2023-06-08T22:49:19.754Z"),
      new Date("2023-06-09T22:49:19.754Z"),
      100
    );
    expect(query.parameters).toEqual(["u1"]);
    expect(query.sql).toEqual(
      'select max(extract(epoch from "h"."occurred_at") * 1000) as "lastOccurred", "h"."error", count("h"."occurred_at") as "count" from "mz_internal"."mz_sink_status_history" as "h" where "h"."sink_id" = $1 and "h"."error" is not null and h.occurred_at between \'2023-06-08T22:49:19.754Z\' AND \'2023-06-09T22:49:19.754Z\' group by "h"."error" limit 100'
    );
  });
});
