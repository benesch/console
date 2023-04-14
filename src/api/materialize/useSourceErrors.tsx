import { extractData, GroupedError, useSql } from "~/api/materialized";

/**
 * Fetches errors for a specific source
 */
export default function useSourceErrors({
  limit = 20,
  sourceId,
  startTime,
  endTime,
}: {
  limit?: number;
  sourceId?: string;
  startTime: Date;
  endTime: Date;
}) {
  const result = useSql(
    sourceId
      ? `
SELECT MAX(extract(epoch from h.occurred_at) * 1000) as last_occurred, h.error, COUNT(h.occurred_at)
FROM mz_internal.mz_source_status_history h
WHERE source_id = '${sourceId}'
AND error IS NOT NULL
AND h.occurred_at BETWEEN '${startTime.toISOString()}' AND '${endTime.toISOString()}'
GROUP BY h.error
ORDER BY last_occurred DESC
LIMIT ${limit};`
      : undefined
  );
  let errors: GroupedError[] | null = null;
  if (result.data) {
    errors = extractData(result.data, (x) => ({
      lastOccurred: new Date(parseInt(x("last_occurred"))),
      error: x("error"),
      count: x("count"),
    }));
  }

  return { ...result, data: errors };
}
