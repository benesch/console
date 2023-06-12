import React from "react";

import { queryBuilder } from "../db";
import useSqlTyped from "../useSqlTyped";

/**
 * Fetches all sinks in the current environment
 */
function useSinks({
  databaseId,
  schemaId,
  nameFilter,
}: { databaseId?: string; schemaId?: string; nameFilter?: string } = {}) {
  const query = React.useMemo(() => {
    let qb = queryBuilder
      .selectFrom("mz_catalog.mz_sinks as s")
      .select(["s.id", "s.name", "s.type", "s.size"])
      .innerJoin("mz_catalog.mz_schemas as sc", "sc.id", "s.schema_id")
      .select("sc.name as schemaName")
      .innerJoin("mz_catalog.mz_databases as d", "d.id", "sc.database_id")
      .select("d.name as databaseName")
      .leftJoin("mz_internal.mz_sink_statuses as st", "st.id", "s.id")
      .select(["st.status", "st.error"]);
    if (databaseId) {
      qb = qb.where("d.id", "=", databaseId);
    }
    if (schemaId) {
      qb = qb.where("sc.id", "=", schemaId);
    }
    if (nameFilter) {
      qb = qb.where("s.name", "like", `%${nameFilter}%`);
    }
    return qb.compile();
  }, [databaseId, nameFilter, schemaId]);

  const sinkResponse = useSqlTyped(query);

  const sinks = sinkResponse.results;

  const getSinkById = (sinkId?: string) =>
    sinks?.find((s) => s.id === sinkId) ?? null;

  return { ...sinkResponse, data: sinks, getSinkById };
}

export type SinksResponse = ReturnType<typeof useSinks>;

export type Sink = SinksResponse["data"][0];

export default useSinks;
