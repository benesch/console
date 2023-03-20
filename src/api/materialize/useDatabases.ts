import { useSql } from "~/api/materialized";
import { assert } from "~/util";

export interface Database {
  id: number;
  name: string;
}

/**
 * Fetches all databases
 */
function useDatabases() {
  const response = useSql(
    `SELECT id, name
FROM mz_databases;`
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

export default useDatabases;
