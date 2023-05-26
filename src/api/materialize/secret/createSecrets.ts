import executeSql, {
  ExecuteSqlError,
  isExecuteSqlError,
} from "~/api/materialize/executeSql";
import { Secret } from "~/api/materialize/secret/useSecrets";
import { EnabledEnvironment } from "~/recoil/environments";
import { assert } from "~/util";

import { attachNamespace } from "..";

export type CreateSecretsError = {
  error: ExecuteSqlError;
  payloadIndex: number;
};

export type CreateSecretsSuccess = {
  secret: Secret;
  payloadIndex: number;
};

type CreateSecretInput = {
  name: string;
  value: string;
  databaseName: string;
  schemaName: string;
};

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

function getSecretQueryBuilder(variables: {
  name: string;
  databaseName: string;
  schemaName: string;
}) {
  return `
SELECT 
  s.id, 
  s.name, 
  d.name as database_name, 
  sc.name as schema_name
FROM mz_secrets s
INNER JOIN mz_schemas sc ON sc.id = s.schema_id
INNER JOIN mz_databases d ON d.id = sc.database_id
WHERE s.name = '${variables.name}'
AND d.name = '${variables.databaseName}'
AND sc.name = '${variables.schemaName}';
`;
}

export async function createSecrets({
  secrets,
  environment,
  accessToken,
}: {
  secrets: CreateSecretInput[];
  environment: EnabledEnvironment;
  accessToken: string;
}) {
  const errors: CreateSecretsError[] = [];
  const createdSecrets: CreateSecretsSuccess[] = [];

  const responses = await Promise.all(
    secrets.map(({ name, value, schemaName, databaseName }) => {
      return executeSql(
        environment,
        {
          queries: [
            {
              query: createSecretQueryBuilder({
                name,
                value,
                schemaName,
                databaseName,
              }),
              params: [],
            },
            {
              query: getSecretQueryBuilder({
                name,
                schemaName,
                databaseName,
              }),
              params: [],
            },
          ],
          cluster: "mz_introspection",
        },
        accessToken
      );
    })
  );

  responses.forEach((response, i) => {
    if (isExecuteSqlError(response)) {
      errors.push({
        error: response,
        payloadIndex: i,
      });

      return;
    }
    const { results } = response;
    const [_, newSecretResult] = results;

    const { getColumnByName, rows } = newSecretResult;
    assert(getColumnByName);
    const [row] = rows;
    const newSecret: Secret = {
      id: getColumnByName(row, "id"),
      name: getColumnByName(row, "name"),
      schemaName: getColumnByName(row, "schema_name"),
      databaseName: getColumnByName(row, "database_name"),
    };

    createdSecrets.push({
      payloadIndex: i,
      secret: newSecret,
    });
  });

  return {
    data: createdSecrets,
    errors,
  };
}

export default createSecrets;
