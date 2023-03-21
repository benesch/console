import { ConnectorStatus, SchemaObject, useSql } from "~/api/materialized";
import { assert } from "~/util";

export interface Source extends SchemaObject {
  type: string;
  size?: string;
  status?: ConnectorStatus;
  error?: string;
}

/**
 * Fetches all sources in the current environment
 */
function useSources() {
  const sourceResponse =
    useSql(`SELECT s.id, d.name as database_name, sc.name as schema_name, s.name, s.type, s.size, st.status, st.error
FROM mz_sources s
INNER JOIN mz_schemas sc ON sc.id = s.schema_id
INNER JOIN mz_databases d ON d.id = sc.database_id
LEFT OUTER JOIN mz_internal.mz_source_statuses st ON st.id = s.id
WHERE s.id LIKE 'u%'
AND s.type <> 'subsource';`);

  let sources: Source[] | null = null;
  if (sourceResponse.data) {
    const { rows, getColumnByName } = sourceResponse.data;
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

  return { ...sourceResponse, data: sources };
}

export interface GroupedError {
  error: string;
  lastOccurred: Date;
  count: number;
}

export default useSources;
