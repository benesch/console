import { useSql } from "../materialized";

/**
 * Fetches the maximum number replicas per cluster based on LaunchDarkly configuration
 */
export default function useMaxReplicasPerCluster() {
  const response = useSql("SHOW max_replicas_per_cluster");

  let max: number | null = null;

  if (response.data) {
    const { rows } = response.data;
    max = rows[0][0] as number;
  }

  return { ...response, data: max };
}
