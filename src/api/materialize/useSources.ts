import React from "react";

import { assert } from "~/util";

import { queryBuilder } from "./db";
import useSqlTyped from "./useSqlTyped";

/**
 * Fetches all sources in the current environment
 */
function useSources({
  databaseId,
  schemaId,
  nameFilter,
}: { databaseId?: string; schemaId?: string; nameFilter?: string } = {}) {
  const query = React.useMemo(() => {
    return queryBuilder
      .selectFrom("mz_catalog.mz_sources as s")
      .select(["s.id", "s.name", "s.type", "s.size"])
      .innerJoin("mz_catalog.mz_schemas as sc", "sc.id", "s.schema_id")
      .select("sc.name as schemaName")
      .innerJoin("mz_catalog.mz_databases as d", "d.id", "sc.database_id")
      .select("d.name as databaseName")
      .leftJoin("mz_internal.mz_source_statuses as st", "st.id", "s.id")
      .select(["st.status", "st.error"])
      .where("s.id", "like", "u%")
      .where("s.type", "<>", "subsource")
      .$if(!!databaseId, (qb) => {
        assert(databaseId);
        return qb.where("d.id", "=", databaseId);
      })
      .$if(!!schemaId, (qb) => {
        assert(schemaId);
        return qb.where("sc.id", "=", schemaId);
      })
      .$if(!!nameFilter, (qb) => {
        assert(nameFilter);
        return qb.where("s.name", "like", `%${nameFilter}%`);
      })
      .compile();
  }, [databaseId, nameFilter, schemaId]);

  const sourceResponse = useSqlTyped(query);

  const sources = sourceResponse.results;

  const getSourceById = (sourceId?: string) =>
    sources?.find((s) => s.id === sourceId) ?? null;

  return { ...sourceResponse, data: sources, getSourceById };
}

export type SourcesResponse = ReturnType<typeof useSources>;

export type Source = SourcesResponse["data"][0];

export default useSources;
