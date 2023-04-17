import React from "react";
import { Navigate, Route, useParams } from "react-router-dom";

import {
  Cluster,
  ClustersProvider,
  useClusters,
} from "~/api/materialize/useClusters";
import ClusterDetailPage from "~/platform/clusters/ClusterDetail";
import ClustersListPage from "~/platform/clusters/ClustersList";
import { SentryRoutes } from "~/sentry";
import useForegroundInterval from "~/useForegroundInterval";

import NewClusterForm from "./NewClusterForm";

export type ClusterDetailParams = {
  regionSlug: string;
  clusterName: string;
};

const ClusterRoutes = () => {
  const clusterResponse = useClusters();
  useForegroundInterval(clusterResponse.refetch);

  return (
    <SentryRoutes>
      <Route path="/" element={<ClustersListPage />} />
      <Route
        path="new"
        element={<NewClusterForm refetchClusters={clusterResponse.refetch} />}
      />
      <Route path=":id/:clusterName/*" element={<ClusterOrRedirect />} />
    </SentryRoutes>
  );
};

const ClusterRoutesWithProvider = () => (
  <ClustersProvider>
    <ClusterRoutes />
  </ClustersProvider>
);

export type ClusterParams = {
  id: string;
  clusterName: string;
};

export const relativeClusterPath = (cluster: { id: string; name: string }) =>
  `${cluster.id}/${encodeURIComponent(cluster.name)}`;

const handleRenamedCluster = (
  cluster: Cluster,
  params: Readonly<Partial<ClusterParams>>
) => {
  if (cluster.name !== params.clusterName) {
    return <Navigate to={`../${relativeClusterPath(cluster)}`} replace />;
  }
  return <ClusterDetailPage />;
};

const ClusterOrRedirect: React.FC = () => {
  const params = useParams<ClusterParams>();
  const { data: clusters } = useClusters();
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

export default ClusterRoutesWithProvider;
