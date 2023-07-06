import { sql } from "kysely";

import { useSqlLazy } from "../materialized";
import { queryBuilder } from "./db";

export function buildCancelQuery(connectionId: string) {
  const query = sql`SELECT pg_cancel_backend(${sql.raw(connectionId)})`;
  return query.compile(queryBuilder);
}

/**
 * Fetches the number of dependencies an object has
 */
function useCancelQuery() {
  const response = useSqlLazy({
    queryBuilder: (connectionId: string) => buildCancelQuery(connectionId).sql,
  });

  return response;
}

export default useCancelQuery;
