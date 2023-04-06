import { useSql } from "~/api/materialized";

/**
 * Fetches available cluster sizes based on LaunchDarkly configuration
 */
export default function useAvailableClusterSizes() {
  const response = useSql("SHOW allowed_cluster_replica_sizes");

  let sizes: string[] | null = null;

  if (response.data) {
    const { rows } = response.data;
    const rawValue = rows[0][0];
    sizes = rawValue
      .split(",")
      .map((v: string) => v.replaceAll('"', "").trim());
  }

  return { ...response, data: sizes };
}
