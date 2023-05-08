import { useSql } from "~/api/materialized";
import { assert } from "~/util";

export interface Schema {
  id: string;
  name: string;
  databaseId: string;
  databaseName: string;
}

/**
 * Fetches all schemas, optionally filtered by database
 */
function useSchemas(databaseId?: string) {
  // Note: we CAST s.id and database_id to text because in v0.52 we changed the database ids and
  // schema ids to be strings, namespaced on either System or User.
  const response = useSql(
    `SELECT CAST(s.id as text) as id, s.name, d.id as database_id, d.name as database_name
FROM mz_schemas s
JOIN mz_databases d
ON s.database_id = d.id
${databaseId ? `WHERE CAST(database_id as text) = '${databaseId}'` : ""}
ORDER BY s.name;`
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

export function isDefaultSchema(schema: Schema) {
  return schema.name === "public" && schema.databaseName === "materialize";
}

export type UseSchemaResponse = ReturnType<typeof useSchemas>;

export default useSchemas;
