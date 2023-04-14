import { extractData, TimestampedCounts, useSql } from "../materialized";

/**
 * Fetches errors for a specific source and subsources, grouped into buckets
 */
export default function useBucketedSourceErrors({
  sourceId,
  startTime,
  endTime,
  bucketSizeSeconds,
}: {
  limit?: number;
  sourceId?: string;
  startTime: Date;
  endTime: Date;
  bucketSizeSeconds: number;
}) {
  const result = useSql(
    sourceId
      ? `
SELECT
  COUNT(error) count,
  EXTRACT(epoch FROM date_bin(
    interval '${bucketSizeSeconds} seconds', occurred_at, '${startTime.toISOString()}'
    )) * 1000 as bin_start
FROM mz_internal.mz_source_status_history
JOIN mz_internal.mz_object_dependencies d ON h.source_id = d.referenced_object_id
WHERE (d.object_id = '${sourceId}' OR source_id = '${sourceId}')
AND occurred_at BETWEEN '${startTime.toISOString()}' AND '${endTime.toISOString()}'
GROUP BY bin_start
ORDER BY bin_start DESC;`
      : undefined
  );
  let statuses: TimestampedCounts[] | null = null;
  if (result.data) {
    statuses = extractData(result.data, (x) => {
      return {
        count: x("count") as number,
        timestamp: parseInt(x("bin_start")) as number,
      };
    });
  }

  return { ...result, data: statuses };
}
