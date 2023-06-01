import { Connection } from "~/api/materialize/connection/useConnections";
import { Cluster } from "~/api/materialize/useClusters";
import { NEW_CLUSTER_ID } from "~/platform/sources/create/NewPostgresSource";

import { attachNamespace, quoteIdentifier } from "..";

export interface CreateSourceParameters {
  name: string;
  connection: Connection;
  databaseName: string;
  schemaName: string;
  cluster: Cluster | null;
  clusterSize: { id: string; name: string } | null;
  publication: string;
  allTables: boolean;
  tables: {
    name: string;
    alias: string;
  }[];
}

const createPostgresSourceStatement = (params: CreateSourceParameters) => {
  if (!params.cluster && !params.clusterSize) {
    throw new Error("You must specify either a cluster or a cluster size");
  }
  const name = attachNamespace(
    params.name,
    params.databaseName,
    params.schemaName
  );
  const createNewCluster = params.cluster?.id === NEW_CLUSTER_ID;

  const connectionName = attachNamespace(
    params.connection.name,
    params.connection.databaseName,
    params.connection.schemaName
  );

  return `
CREATE SOURCE ${name}${
    createNewCluster ? "" : `\nIN CLUSTER ${params.cluster?.name}`
  }
FROM POSTGRES CONNECTION ${connectionName} (PUBLICATION '${params.publication}')
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
}${createNewCluster ? `\nWITH (SIZE = '${params.clusterSize?.name}')` : ""};`;
};

export default createPostgresSourceStatement;
