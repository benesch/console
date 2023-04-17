import { createContext, PropsWithChildren } from "react";
import React from "react";

import { useSql } from "~/api/materialized";
import { assert } from "~/util";

export interface Cluster {
  id: string;
  name: string;
  replicas: Replica[];
}

export interface Replica {
  id: string;
  name: string;
  size: string;
  clusterName: string;
}

const ClustersContext = createContext<ClusterResponse | null>(null);

/**
 * Fetches all clusters in the current environment.
 */
export function useClustersFetch() {
  const response = useSql(
    `SELECT c.id,
    c.name as cluster_name,
    r.id as replica_id,
    r.name as replica_name,
    r.size
  FROM mz_clusters c
  LEFT OUTER JOIN mz_cluster_replicas r ON c.id = r.cluster_id
  ORDER BY r.id;`
  );

  const clusterMap: Map<string, Cluster> = new Map();
  if (response.data) {
    const { getColumnByName } = response.data;
    assert(getColumnByName);

    response.data.rows.forEach((row) => {
      const clusterId = getColumnByName(row, "id") as string;
      const clusterName = getColumnByName(row, "cluster_name") as string;
      const replicaId = getColumnByName(row, "replica_id") as
        | string
        | undefined;
      const replica: Replica | undefined = replicaId
        ? {
            id: replicaId.toString(),
            name: getColumnByName(row, "replica_name") as string,
            size: getColumnByName(row, "size") as string,
            clusterName: clusterName,
          }
        : undefined;
      const cluster = clusterMap.get(clusterId);
      if (cluster && replica) {
        cluster.replicas.push(replica);
      } else {
        clusterMap.set(clusterId, {
          id: clusterId,
          name: clusterName,
          replicas: replica ? [replica] : [],
        });
      }
    });
  }

  const getClusterById = (clusterId?: string) =>
    clusterId ? clusterMap.get(clusterId) : null;

  return {
    ...response,
    data: response.data ? Array.from(clusterMap.values()) : null,
    getClusterById,
  };
}

export type ClusterResponse = ReturnType<typeof useClustersFetch>;

export const ClustersProvider = ({ children }: PropsWithChildren) => {
  const clustersResponse = useClustersFetch();

  return (
    <ClustersContext.Provider value={clustersResponse}>
      {children}
    </ClustersContext.Provider>
  );
};

export const useClusters = () => {
  const context = React.useContext(ClustersContext);
  if (!context) {
    throw new Error(
      "`useClusters` hook must be used within a `ClustersProvider` component"
    );
  }
  return context;
};
