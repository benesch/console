import { SchemaObject, useSql } from "~/api/materialized";
import { assert } from "~/util";

import { buildWhereConditions } from "..";

export type ConnectionType = "postgres" | "kafka";

export interface ConnectionWithDetails extends SchemaObject {
  type: ConnectionType;
  numSinks: number;
  numSources: number;
}

export interface Connection extends SchemaObject {
  type: ConnectionType;
}

/**
 * Fetches all sources in the current environment
 */
function useConnections({
  databaseId,
  schemaId,
  nameFilter,
}: { databaseId?: string; schemaId?: string; nameFilter?: string } = {}) {
  // Note: we CAST databases.id and schemas.id to text because in v0.52 we changed the database ids
  // and schema ids to be strings, namespaced on either System or User.
  const connectionResponse = useSql(`    
SELECT 
    connections.id, 
    connections.name,
    schemas.name as schema_name,
    databases.name as database_name,
    connections.type,
    COUNT(sinks.id) AS num_sinks, 
    COUNT(sources.id) AS num_sources
FROM mz_connections AS connections
INNER JOIN mz_schemas schemas ON schemas.id = connections.schema_id
INNER JOIN mz_databases databases ON databases.id = schemas.database_id
LEFT JOIN mz_sinks AS sinks ON connections.id = sinks.connection_id 
LEFT JOIN mz_sources AS sources ON connections.id = sources.connection_id 
WHERE 
    COALESCE(sources.type, '') <> 'subsource'
    ${databaseId ? `AND CAST(databases.id as text) = '${databaseId}'` : ""}
    ${schemaId ? `AND CAST(schemas.id as text) = '${schemaId}'` : ""}
    ${nameFilter ? `AND connections.name LIKE '%${nameFilter}%'` : ""}
GROUP BY connections.id, connections.name, connections.type, schema_name, database_name;`);

  let connections: ConnectionWithDetails[] | null = null;
  if (connectionResponse.data) {
    const { rows, getColumnByName } = connectionResponse.data;
    assert(getColumnByName);

    connections = rows.map((row) => ({
      id: getColumnByName(row, "id"),
      name: getColumnByName(row, "name"),
      schemaName: getColumnByName(row, "schema_name"),
      databaseName: getColumnByName(row, "database_name"),
      type: getColumnByName(row, "type"),
      numSinks: getColumnByName(row, "num_sinks"),
      numSources: getColumnByName(row, "num_sources"),
    }));
  }

  return { ...connectionResponse, data: connections };
}

export type ConnectionsResponse = ReturnType<typeof useConnections>;

/**
 * Fetches all connections, filter by any of the following:
 * * type
 * * name substring
 */
export function useConnectionsFiltered({
  nameFilter,
  type,
}: { nameFilter?: string; type?: ConnectionType } = {}) {
  const filters = [
    nameFilter ? `connections.name ILIKE '%${nameFilter}%'` : undefined,
    type ? `connections.type = '${type}'` : undefined,
  ];
  const connectionResponse = useSql(`
SELECT
  connections.id,
  connections.name,
  schemas.name as schema_name,
  databases.name as database_name,
  connections.type
FROM mz_connections AS connections
INNER JOIN mz_schemas schemas ON schemas.id = connections.schema_id
INNER JOIN mz_databases databases ON databases.id = schemas.database_id${buildWhereConditions(
    filters
  )};`);

  let connections: Connection[] | null = null;
  if (connectionResponse.data) {
    const { rows, getColumnByName } = connectionResponse.data;
    assert(getColumnByName);

    connections = rows.map((row) => ({
      id: getColumnByName(row, "id"),
      name: getColumnByName(row, "name"),
      schemaName: getColumnByName(row, "schema_name"),
      databaseName: getColumnByName(row, "database_name"),
      type: getColumnByName(row, "type"),
    }));
  }

  return { ...connectionResponse, data: connections };
}

export default useConnections;
