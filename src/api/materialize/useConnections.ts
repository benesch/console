import { SchemaObject, useSql } from "~/api/materialized";
import { assert } from "~/util";

export interface Connection extends SchemaObject {
  type: string;
  numSinks: number;
  numSources: number;
}

/**
 * Fetches all sources in the current environment
 */
function useConnections({
  databaseId,
  schemaId,
  nameFilter,
}: { databaseId?: number; schemaId?: number; nameFilter?: string } = {}) {
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
    ${databaseId ? `AND databases.id = ${databaseId}` : ""}
    ${schemaId ? `AND schemas.id = ${schemaId}` : ""}
    ${nameFilter ? `AND connections.name LIKE '%${nameFilter}%'` : ""}
GROUP BY connections.id, connections.name, connections.type, schema_name, database_name;`);

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
      numSinks: getColumnByName(row, "num_sinks"),
      numSources: getColumnByName(row, "num_sources"),
    }));
  }

  return { ...connectionResponse, data: connections };
}

export type ConnectionsResponse = ReturnType<typeof useConnections>;

export default useConnections;
