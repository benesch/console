import { useSql } from "~/api/materialized";
import { assert } from "~/util";

import { DEFAULT_DATABASE_NAME } from "./useDatabases";

export interface Schema {
  id: string;
  name: string;
  databaseId: string;
  databaseName: string;
}

const DEFAULT_SCHEMA_NAME = "public";

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
  return (
    schema.name === DEFAULT_SCHEMA_NAME &&
    schema.databaseName === DEFAULT_DATABASE_NAME
  );
}

/**
 * Creates a map of schemas keyed by its database name
 */
function groupSchemasByDatabaseName(schemas: Schema[]): Map<string, Schema[]> {
  const groups = schemas.reduce((accum, schema) => {
    const { databaseName } = schema;
    const group = accum.get(databaseName);

    if (group) {
      group.push(schema);
    } else {
      accum.set(databaseName, [schema]);
    }

    return accum;
  }, new Map());

  return groups;
}

/**
 * Creates react-select options grouped by database names
 */
export function buildSchemaSelectOptions(schemas: Schema[]) {
  const schemasByDatabaseName = groupSchemasByDatabaseName(schemas);
  return Array.from(schemasByDatabaseName, ([key, value]) => ({
    label: key,
    options: value,
  }));
}

export type UseSchemaResponse = ReturnType<typeof useSchemas>;

export default useSchemas;
