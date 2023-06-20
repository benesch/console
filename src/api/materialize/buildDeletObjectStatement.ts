import { sql } from "kysely";

import { escapedIdentifier as id } from "~/api/materialize";
import { queryBuilder } from "~/api/materialize/db";

export function deleteObjectQueryBuilder(variables: {
  objectName: string;
  objectType: string;
}) {
  const query = sql`DROP ${sql.raw(variables.objectType)} ${id(
    variables.objectName
  )} CASCADE`;
  return query.compile(queryBuilder).sql;
}
