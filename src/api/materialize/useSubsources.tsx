import { useSql } from "~/api/materialized";
import { assert } from "~/util";

export interface Subsource {
  id: string;
  name: string;
}

/**
 * Fetches subsoures for a single source
 */
export function useSubsources(sourceId?: string) {
  const response = useSql(
    sourceId
      ? `SELECT id, name
FROM mz_sources s
JOIN mz_internal.mz_object_dependencies d ON s.id = d.referenced_object_id
WHERE d.object_id = '${sourceId}';`
      : undefined
  );
  let sources: Subsource[] | null = null;
  if (response.data) {
    const { rows, getColumnByName } = response.data;
    assert(getColumnByName);

    sources = rows.map((row) => ({
      id: getColumnByName(row, "id"),
      name: getColumnByName(row, "name"),
    }));
  }

  return { ...response, data: sources };
}
