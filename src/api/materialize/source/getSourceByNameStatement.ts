function getSourceByNameStatement(
  name: string,
  databaseName: string,
  schemaName: string
) {
  return `SELECT s.id, d.name as database_name, sc.name as schema_name
FROM mz_sources s
INNER JOIN mz_schemas sc ON sc.id = s.schema_id
INNER JOIN mz_databases d ON d.id = sc.database_id
WHERE s.name = '${name}'
AND sc.name = '${schemaName}'
AND d.name = '${databaseName}';`;
}

export default getSourceByNameStatement;
