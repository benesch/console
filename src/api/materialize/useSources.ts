import React from "react";

import { ConnectorStatus, SchemaObject, useSqlMany } from "~/api/materialized";
import { assert } from "~/util";

import { queryBuilder } from "./db";

export interface Source extends SchemaObject {
  type: string;
  size?: string;
  status?: ConnectorStatus;
  error?: string;
}

/**
 * Fetches all sources in the current environment
 */
function useSources({
  databaseId,
  schemaId,
  nameFilter,
}: { databaseId?: string; schemaId?: string; nameFilter?: string } = {}) {
  const request = React.useMemo(() => {
    const query = queryBuilder
      .selectFrom("mz_catalog.mz_sources as s")
      .select(["s.id", "s.name", "s.type", "s.size"])
      .innerJoin("mz_catalog.mz_schemas as sc", "sc.id", "s.schema_id")
      .select("sc.name as schema_name")
      .innerJoin("mz_catalog.mz_databases as d", "d.id", "sc.database_id")
      .select("d.name as database_name")
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
    return {
      queries: [
        {
          query: query.sql,
          params: query.parameters as string[],
        },
      ],
      cluster: "mz_introspection",
    };
  }, [databaseId, nameFilter, schemaId]);

  const sourceResponse = useSqlMany(request);

  let sources: Source[] | null = null;
  if (sourceResponse.data) {
    const { rows, getColumnByName } = sourceResponse.data[0];
    assert(getColumnByName);

    sources = rows.map((row) => ({
      id: getColumnByName(row, "id"),
      name: getColumnByName(row, "name"),
      schemaName: getColumnByName(row, "schema_name"),
      databaseName: getColumnByName(row, "database_name"),
      type: getColumnByName(row, "type"),
      size: getColumnByName(row, "size"),
      status: getColumnByName(row, "status"),
      error: getColumnByName(row, "error"),
    }));
  }

  const getSourceById = (sourceId?: string) =>
    sources?.find((s) => s.id === sourceId) ?? null;

  return { ...sourceResponse, data: sources, getSourceById };
}

export type SourcesResponse = ReturnType<typeof useSources>;

export default useSources;
