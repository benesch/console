import { useSql } from "~/api/materialized";
import { assert } from "~/util";

export interface Schema {
  id: number;
  name: string;
  databaseId: number;
  databaseName: string;
}

/**
 * Fetches all schemas, optionally filtered by database
 */
function useSchemas(databaseId?: number) {
  const response = useSql(
    `SELECT s.id, s.name, d.id as database_id, d.name as database_name
FROM mz_schemas s
JOIN mz_databases d
ON s.database_id = d.id
${databaseId ? `WHERE database_id = ${databaseId}` : ""}
    ;`
  );
  let schemas: Schema[] | null = null;
  if (response.data) {
    const { rows, getColumnByName } = response.data;
    assert(getColumnByName);

    schemas = rows.map((row) => ({
      id: getColumnByName(row, "id"),
      name: getColumnByName(row, "name"),
      databaseId: getColumnByName(row, "database_id"),
      databaseName: getColumnByName(row, "database_name"),
    }));
  }

  return { ...response, data: schemas };
}

export type UseSchemaResponse = ReturnType<typeof useSchemas>;

export default useSchemas;
