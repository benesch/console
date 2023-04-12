import React from "react";
import { Navigate, Route, useParams } from "react-router-dom";

import { Cluster, useClusters } from "~/api/materialized";
import ClusterDetailPage from "~/platform/clusters/ClusterDetail";
import ClustersListPage from "~/platform/clusters/ClustersList";
import { SentryRoutes } from "~/sentry";
import { usePoll } from "~/useForegroundInterval";

import NewClusterForm from "./NewClusterForm";

export type ClusterDetailParams = {
  regionSlug: string;
  clusterName: string;
};

const ClusterRoutes = () => {
  const clusterResponse = useClusters();
  usePoll(clusterResponse.loading, clusterResponse.refetch);

  return (
    <SentryRoutes>
      <Route
        path="/"
        element={<ClustersListPage clusterResponse={clusterResponse} />}
      />
      <Route path="new" element={<NewClusterForm />} />
      <Route
        path=":id/:clusterName/*"
        element={<ClusterOrRedirect clusters={clusterResponse.data} />}
      />
    </SentryRoutes>
  );
};

type ClusterParams = {
  id: string;
  clusterName: string;
};

export const relativeClusterPath = (cluster: Cluster) =>
  `${cluster.id}/${encodeURIComponent(cluster.name)}`;

const handleRenamedCluster = (
  cluster: Cluster,
  params: Readonly<Partial<ClusterParams>>
) => {
  if (cluster.name !== params.clusterName) {
    return <Navigate to={`../${relativeClusterPath(cluster)}`} replace />;
  }
  return <ClusterDetailPage cluster={cluster} />;
};

const ClusterOrRedirect: React.FC<{ clusters: Cluster[] | null }> = ({
  clusters,
}) => {
  const params = useParams<ClusterParams>();
  // Show loading state until clusters load
  if (!clusters) {
    return <ClusterDetailPage />;
  }
  let cluster = clusters?.find((c) => c.id === params.id);
  if (cluster) {
    return handleRenamedCluster(cluster, params);
  }
  cluster = clusters?.find((c) => c.name === params.clusterName);
  if (cluster) {
    // since the ID didn't match, update the url
    return <Navigate to={`../${relativeClusterPath(cluster)}`} replace />;
  }
  // Cluster not found, redirect to cluster list
  return <Navigate to=".." replace />;
};

export default ClusterRoutes;
