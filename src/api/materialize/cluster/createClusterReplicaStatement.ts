export default function createClusterReplicaStatement(values: {
  clusterName: string;
  name: string;
  size: string;
}) {
  return `CREATE CLUSTER REPLICA ${values.clusterName}.${values.name} SIZE = '${values.size}'
`;
}
