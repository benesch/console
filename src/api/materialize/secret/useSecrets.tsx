import { assert } from "~/util";

import { Results, useSql } from "../../materialized";
import { attachNamespace } from "..";

export interface Secret {
  id: string;
  name: string;
  databaseName: string;
  schemaName: string;
}

export function normalizeSecretsRow(
  row: unknown[],
  getColumnByName: Results["getColumnByName"]
) {
  assert(getColumnByName);
  return {
    id: getColumnByName<unknown, string>(row, "id"),
    name: getColumnByName<unknown, string>(row, "name"),
    databaseName: getColumnByName<unknown, string>(row, "database_name"),
    schemaName: getColumnByName<unknown, string>(row, "schema_name"),
  };
}

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

export interface ListPageSecret extends Secret {
  createdAt: Date;
}
/**
 * Fetches all secrets in the current environment
 */
export function useSecretsListPage({
  databaseId,
  schemaId,
  nameFilter,
}: { databaseId?: string; schemaId?: string; nameFilter?: string } = {}) {
  const secretResponse = useSql(`
  SELECT 
    s.id, 
    s.name, 
    events.occurred_at as created_at,
    d.name as database_name, 
    sc.name as schema_name
  FROM mz_secrets s
  INNER JOIN mz_audit_events events ON events.details->>'id' = s.id
    AND event_type='create' AND object_type='secret'
  INNER JOIN mz_schemas sc ON sc.id = s.schema_id
  INNER JOIN mz_databases d ON d.id = sc.database_id
    ${databaseId ? `AND d.id = '${databaseId}'` : ""}
    ${schemaId ? `AND sc.id = '${schemaId}'` : ""}
    ${nameFilter ? `AND s.name LIKE '%${nameFilter}%'` : ""}
  ORDER BY created_at DESC;
  `);
  let secrets: ListPageSecret[] | null = null;
  if (secretResponse.data) {
    const { rows, getColumnByName } = secretResponse.data;
    assert(getColumnByName);

    secrets = rows.map((row) => {
      return {
        ...normalizeSecretsRow(row, getColumnByName),
        createdAt: new Date(parseInt(getColumnByName(row, "created_at"))),
      };
    });
  }

  return { ...secretResponse, data: secrets };
}

/**
 * Fetches all secrets for for selects in creation flow
 */
export function useSecretsCreationFlow() {
  const secretResponse = useSql(`
  SELECT 
    s.id, 
    s.name, 
    d.name as database_name, 
    sc.name as schema_name
  FROM mz_secrets s
  INNER JOIN mz_schemas sc ON sc.id = s.schema_id
  INNER JOIN mz_databases d ON d.id = sc.database_id
  ;
  `);
  let secrets: Secret[] | null = null;
  if (secretResponse.data) {
    const { rows, getColumnByName } = secretResponse.data;
    secrets = rows.map((row) => normalizeSecretsRow(row, getColumnByName));
  }

  return { ...secretResponse, data: secrets };
}

export default useSecretsListPage;
