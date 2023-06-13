import { CompiledQuery } from "kysely";
import React from "react";

import { useSqlMany } from "../materialized";

function useSqlTyped<R, Result = R>(
  query: CompiledQuery<R> | null,
  options: {
    cluster?: string;
    replica?: string;
    transformRow?: (r: R) => Result;
  } = {}
) {
  const { cluster, replica, transformRow } = options;
  const request = React.useMemo(() => {
    if (!query) return undefined;
    return {
      queries: [
        {
          query: query.sql,
          params: query.parameters as string[],
        },
      ],
      cluster: cluster ?? "mz_introspection",
      replica: replica,
    };
  }, [query, cluster, replica]);
  const inner = useSqlMany(query ? request : undefined);

  let results: Result[] = [];

  if (inner.data) {
    const { columns, rows } = inner.data[0];
    results = rows.map((r: unknown[]) => {
      const o: Record<string, unknown> = {};
      for (let i = 0; i < columns.length; i++) {
        o[columns[i]] = r[i];
      }
      if (transformRow) {
        return transformRow(o as R);
      }
      return o as Result;
    });
  }

  return { ...inner, results };
}

export default useSqlTyped;
