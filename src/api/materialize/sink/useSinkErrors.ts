import { sql } from "kysely";
import React from "react";

import { escapedLiteral as lit, rawLimit } from "~/api/materialize";

import { queryBuilder } from "../db";
import useSqlTyped from "../useSqlTyped";

export function buildSinkErrorsQuery(
  sinkId: string,
  startTime: Date,
  endTime: Date,
  limit: number
) {
  const qb = queryBuilder
    .selectFrom("mz_internal.mz_sink_status_history as h")
    .select((eb) => {
      const occurredAt = eb.ref("h.occurred_at");
      return sql<string>`max(extract(epoch from ${occurredAt}) * 1000)`.as(
        "lastOccurred"
      );
    })
    .select("h.error")
    .select((eb) => eb.fn.count<number>("h.occurred_at").as("count"))
    .where("h.sink_id", "=", sinkId)
    .where("h.error", "is not", null)
    .$narrowType<{ error: string }>()
    .where(
      sql`h.occurred_at between ${lit(startTime.toISOString())} AND ${lit(
        endTime.toISOString()
      )}`
    )
    .groupBy("h.error");

  return rawLimit(qb, limit).compile();
}

/**
 * Fetches errors for a specific sink
 */
function useSinkErrors({
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
  const query = React.useMemo(
    () =>
      sinkId ? buildSinkErrorsQuery(sinkId, startTime, endTime, limit) : null,
    [limit, sinkId, startTime, endTime]
  );

  const sinkResponse = useSqlTyped(query, {
    transformRow: (r) => {
      return {
        ...r,
        lastOccurred: new Date(parseInt(r.lastOccurred)),
      };
    },
  });

  const sinks = sinkResponse.results;

  return { ...sinkResponse, data: sinks };
}

export type SinkErrorsResponse = ReturnType<typeof useSinkErrors>;

export type GroupedError = SinkErrorsResponse["data"][0];

export default useSinkErrors;
