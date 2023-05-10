import { assert } from "~/util";

import { SchemaObject, useSql } from "../materialized";
import { quoteIdentifier } from ".";

export type DDLNoun = "SINK" | "SOURCE";

/**
 * Fetches the DDL statement for creating a schema object
 */
function useShowCreate(noun: DDLNoun, schemaObject?: SchemaObject) {
  const name = schemaObject
    ? `${quoteIdentifier(schemaObject.databaseName)}.${quoteIdentifier(
        schemaObject.schemaName
      )}.${quoteIdentifier(schemaObject.name)}`
    : undefined;

  const response = useSql(
    schemaObject ? `SHOW CREATE ${noun} ${name}` : undefined
  );
  let ddl: string | null = null;
  if (schemaObject && response.data) {
    const { rows, getColumnByName } = response.data;
    assert(getColumnByName);

    ddl = getColumnByName(rows[0], "create_sql");
  }

  return { ...response, ddl };
}

export default useShowCreate;
