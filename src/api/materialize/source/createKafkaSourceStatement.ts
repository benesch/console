import { Cluster } from "~/api/materialize/cluster/useConnectorClusters";
import { Connection } from "~/api/materialize/connection/useConnections";
import {
  KafkaEnvelope,
  KafkaFormat,
  NEW_CLUSTER_ID,
} from "~/platform/sources/create/NewKafkaSource";

import { attachNamespace } from "..";

export interface CreateKafkaSourceParameters {
  name: string;
  connection: Connection;
  databaseName: string;
  schemaName: string;
  cluster: Cluster;
  clusterSize?: { id: string; name: string } | null;
  topic: string;
  format: KafkaFormat;
  formatConnection: Connection | null;
  envelope: KafkaEnvelope;
}

function createFormatSpecStatement(
  format: KafkaFormat,
  formatConnection: Connection | null
) {
  let formatSpecStr = "";

  if (format === "avro" || format === "protobuf") {
    if (!formatConnection) {
      throw new Error("Format must have a schema registry connection.");
    }
    const formatConnectionName = attachNamespace(
      formatConnection.name,
      formatConnection.databaseName,
      formatConnection.schemaName
    );
    formatSpecStr = ` USING CONFLUENT SCHEMA REGISTRY CONNECTION ${formatConnectionName}`;
  }

  return `FORMAT ${format.toUpperCase()}${formatSpecStr}`;
}

const createKafkaSourceStatement = (params: CreateKafkaSourceParameters) => {
  if (!params.cluster && !params.clusterSize) {
    throw new Error("You must specify either a cluster or a cluster size");
  }

  const createNewCluster = params.cluster?.id === NEW_CLUSTER_ID;
  const name = attachNamespace(
    params.name,
    params.databaseName,
    params.schemaName
  );

  const connectionName = attachNamespace(
    params.connection.name,
    params.connection.databaseName,
    params.connection.schemaName
  );

  return `
CREATE SOURCE ${name}${
    createNewCluster ? "" : `\nIN CLUSTER ${params.cluster?.name}`
  }
FROM KAFKA CONNECTION ${connectionName} (TOPIC '${params.topic}')
${createFormatSpecStatement(params.format ?? "", params.formatConnection)}
${createNewCluster ? `\nWITH (SIZE = '${params.clusterSize?.name}')` : ""};`;
};

export default createKafkaSourceStatement;
