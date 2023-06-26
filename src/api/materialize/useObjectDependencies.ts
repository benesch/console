import React from "react";

import { queryBuilder } from "./db";
import useSqlTyped from "./useSqlTyped";

export function buildObjectDependenciesQuery(objectId: string) {
  const { count } = queryBuilder.fn;
  const qb = queryBuilder
    .selectFrom("mz_internal.mz_object_transitive_dependencies")
    .select(count("id").as("count"))
    .where("referenced_object_id", "=", objectId);
  return qb.compile();
}

/**
 * Fetches the number of dependencies an object has
 */
function useObjectDependencies(objectId: string) {
  const query = React.useMemo(
    () => buildObjectDependenciesQuery(objectId),
    [objectId]
  );

  const response = useSqlTyped(query);

  let count = null;
  if (response.results?.length > 0) {
    count = parseInt(response.results[0].count as string);
  }
  return { ...response, data: count, results: count };
}

export default useObjectDependencies;
