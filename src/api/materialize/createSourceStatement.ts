import { assert } from "~/util";

import { quoteIdentifier } from ".";
import { Cluster } from "./useClusters";
import { Connection } from "./useConnections";

export interface CreateSourceParameters {
  name: string;
  connection: Connection | null;
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

  return `
CREATE SOURCE ${params.name}
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
