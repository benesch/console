import { sql } from "kysely";

import {
  escapedIdentifier as id,
  escapedLiteral as lit,
} from "~/api/materialize";
import { Connection } from "~/api/materialize/connection/useConnections";
import { queryBuilder } from "~/api/materialize/db";
import { Cluster } from "~/api/materialize/useClusters";
import { NEW_CLUSTER_ID } from "~/platform/sources/create/NewPostgresSource";
import { assert } from "~/util";

export interface CreateSourceParameters {
  name: string;
  connection: Connection;
  databaseName: string;
  schemaName: string;
  cluster: Cluster;
  clusterSize: { id: string; name: string } | null;
  publication: string;
  allTables: boolean;
  tables: {
    name: string;
    alias: string;
  }[];
}

const createPostgresSourceStatement = (params: CreateSourceParameters) => {
  if (params.cluster.id === "0" && !params.clusterSize) {
    throw new Error("You must specify either a cluster or a cluster size");
  }
  const createNewCluster = params.cluster?.id === NEW_CLUSTER_ID;
  let withSize = sql``;
  if (createNewCluster) {
    assert(params.clusterSize?.name);
    withSize = sql`\nWITH (SIZE = ${lit(params.clusterSize?.name)})`;
  }

  assert(params.connection?.name);
  assert(params.cluster?.name);
  const query = sql`
CREATE SOURCE ${id(params.databaseName)}.${id(params.schemaName)}.${id(
    params.name
  )}${
    params.cluster.id !== NEW_CLUSTER_ID
      ? sql`\nIN CLUSTER ${id(params.cluster.name)}`
      : sql``
  }
FROM POSTGRES CONNECTION ${id(params.connection.databaseName)}.${id(
    params.connection.schemaName
  )}.${id(params.connection.name)} (PUBLICATION ${lit(params.publication)})
${
  params.allTables
    ? sql`FOR ALL TABLES`
    : sql`FOR TABLES (${sql.join(
        params.tables.map(
          (t) => sql`${id(t.name)}${t.alias ? sql` AS ${id(t.alias)}` : sql``}`
        )
      )})`
}${withSize};`;

  return query.compile(queryBuilder).sql;
};

export default createPostgresSourceStatement;
