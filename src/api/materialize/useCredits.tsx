import { extractData, useSql } from "~/api/materialized";

export interface ClusterHistoryEntry {
  replicaId: string;
  // TODO [btv] Add these once a version of Mz goes out that has them in
  // `mz_cluster_replica_history`.
  // See e.g. https://github.com/MaterializeInc/materialize/pull/19300
  //
  // clusterName: string;
  // replicaName: string;
  size: string;
  createdAt: Date;
  // `null` corresponds to a cluster that
  // still exists.
  droppedAt: Date | null;
  creditsPerHour: number;
}

// A `null` since means get all the clusters that are still
// running.
function useClusterHistory(since: Date | null) {
  let dropped_at_filter: string;
  if (since) {
    dropped_at_filter = `dropped_at >= '${since.toISOString()}'`;
  } else {
    dropped_at_filter = "false";
  }
  const query = `SELECT mcrh.replica_id, mcrh.size, mcrh.created_at, mcrh.dropped_at, mcrh.credits_per_hour
FROM mz_internal.mz_cluster_replica_history mcrh
WHERE mcrh.dropped_at IS NULL OR ${dropped_at_filter}`;
  const result = useSql(query);

  let history: ClusterHistoryEntry[] | null = null;

  if (result.data) {
    history = extractData(result.data, (x) => {
      const droppedAtStr = x("dropped_at");
      return {
        replicaId: x("replica_id"),
        size: x("size"),
        createdAt: new Date(x("created_at")),
        droppedAt: droppedAtStr && new Date(droppedAtStr),
        creditsPerHour: Number(x("credits_per_hour")),
      };
    });
  }

  return { ...result, history };
}

/**
 * Gets the number of compute credits per hour
 * that are currently being consumed
 */
export function useInstantCreditsConsumed() {
  const result = useClusterHistory(null);

  let value = null;
  if (result.history) {
    value = result.history.reduce((acc, h) => acc + h.creditsPerHour, 0);
  }

  return { ...result, value };
}
