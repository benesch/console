import { useSql } from "~/api/materialized";
import { assert } from "~/util";

export interface Database {
  id: string;
  name: string;
}

export const DEFAULT_DATABASE_NAME = "materialize";

/**
 * Fetches all databases in the current environment
 */
function useDatabases() {
  const response = useSql(
    `SELECT CAST(id as text) as id, name
FROM mz_databases
ORDER BY name;`
  );
  let databases: Database[] | null = null;
  if (response.data) {
    const { rows, getColumnByName } = response.data;
    assert(getColumnByName);

    databases = rows.map((row) => ({
      id: getColumnByName(row, "id"),
      name: getColumnByName(row, "name"),
    }));
  }

  return { ...response, data: databases };
}

export type UseDatabaseResponse = ReturnType<typeof useDatabases>;

export default useDatabases;
