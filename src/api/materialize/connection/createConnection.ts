import { executeSql, isExecuteSqlError } from "~/api/materialized";
import { EnabledEnvironment } from "~/recoil/environments";

async function createConnection({
  connectionName,
  databaseName,
  schemaName,
  createConnectionQuery,
  environment,
  accessToken,
}: {
  createConnectionQuery: string;
  connectionName: string;
  databaseName: string;
  schemaName: string;
  environment: EnabledEnvironment;
  accessToken: string;
}) {
  const createConnectionResponse = await executeSql(
    environment,
    {
      queries: [
        { query: createConnectionQuery, params: [] },
        {
          query: `SELECT c.id
                          FROM mz_connections c
                          INNER JOIN mz_schemas sc ON sc.id = c.schema_id
                          INNER JOIN mz_databases d ON d.id = sc.database_id
                          WHERE c.name = $1
                          AND sc.name=$2
                          AND d.name=$3;`,
          params: [connectionName, schemaName, databaseName],
        },
      ],
      cluster: "mz_introspection",
    },
    accessToken
  );

  let response;

  if (isExecuteSqlError(createConnectionResponse)) {
    response = {
      error: createConnectionResponse,
    };
  } else {
    const [_, selectConnectionResponse] = createConnectionResponse.results;
    const [connectionId] = selectConnectionResponse.rows[0];
    response = {
      data: {
        connectionId: connectionId as string,
      },
    };
  }

  return response;
}

export default createConnection;
