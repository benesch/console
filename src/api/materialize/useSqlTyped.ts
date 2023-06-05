import { CompiledQuery } from "kysely";
import React from "react";

import { useSqlMany } from "../materialized";

function useSqlTyped<R>(query: CompiledQuery<R>, cluster?: string) {
  const request = React.useMemo(
    () => ({
      queries: [
        {
          query: query.sql,
          params: query.parameters as string[],
        },
      ],
      cluster: cluster ?? "mz_introspection",
    }),
    [query, cluster]
  );
  const inner = useSqlMany(request);

  let results: R[] = [];

  if (inner.data) {
    const { columns, rows } = inner.data[0];
    results = rows.map((r: unknown[]) => {
      const o: Record<string, unknown> = {};
      for (let i = 0; i < columns.length; i++) {
        o[columns[i]] = r[i];
      }
      return o as R;
    });
  }

  return { ...inner, results };
}

export default useSqlTyped;
