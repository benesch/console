import { attachNamespace } from "..";

export function createSecretQueryBuilder(variables: {
  name: string;
  value: string;
  databaseName: string;
  schemaName: string;
}) {
  const name = attachNamespace(
    variables.name,
    variables.databaseName,
    variables.schemaName
  );
  return `
  CREATE SECRET ${name}
  AS '${variables.value}'
`;
}
