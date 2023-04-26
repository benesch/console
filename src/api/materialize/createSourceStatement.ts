import { assert, notNullOrUndefined } from "~/util";

import { quoteIdentifier } from ".";
import { Cluster } from "./useClusters";
import { Connection } from "./useConnections";
import { Database } from "./useDatabases";
import { Schema } from "./useSchemas";

export interface CreateSourceParameters {
  name: string;
  connection: Connection | null;
  database?: Database | null;
  schema?: Schema | null;
  cluster: Cluster | null;
  publication: string;
  allTables: boolean;
  tables: {
    name: string;
    alias: string;
  }[];
}

const createSourceStatement = (params: CreateSourceParameters) => {
  assert(params.connection?.name);
  assert(params.cluster?.name);
  const namespace = [params.database?.name, params.schema?.name]
    .filter(notNullOrUndefined)
    .map(quoteIdentifier)
    .join(".");
  const name = namespace ? `${namespace}.${params.name}` : params.name;

  return `
CREATE SOURCE ${name}
IN CLUSTER ${params.cluster.name}
FROM POSTGRES CONNECTION ${quoteIdentifier(
    params.connection.name
  )} (PUBLICATION '${params.publication}')
${
  params.allTables
    ? "FOR ALL TABLES"
    : `FOR TABLES (
${params.tables
  .map(
    (t) =>
      `${quoteIdentifier(t.name)}${
        t.alias ? ` AS ${quoteIdentifier(t.alias)}` : ""
      }`
  )
  .join(",\n")})`
};`;
};

export default createSourceStatement;
