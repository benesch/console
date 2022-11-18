import { useInterval } from "@chakra-ui/react";
import React from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";

import { Cluster, useClusters } from "~/api/materialized";
import ClusterDetailPage from "~/platform/clusters/ClusterDetail";
import ClustersListPage from "~/platform/clusters/ClustersList";

export type ClusterDetailParams = {
  clusterName: string;
};

const ClusterRoutes = () => {
  const { clusters, refetch } = useClusters();
  useInterval(refetch, 5000);
  return (
    <Routes>
      <Route path="/" element={<ClustersListPage clusters={clusters} />} />
      <Route
        path=":clusterName"
        element={<ClusterOrRedirect clusters={clusters} />}
      />
    </Routes>
  );
};

const ClusterOrRedirect: React.FC<{ clusters: Cluster[] | null }> = ({
  clusters,
}) => {
  const params = useParams();
  const cluster = clusters?.find((c) => c.name === params.clusterName);
  if (clusters && !cluster) {
    return <Navigate to="/clusters" replace />;
  } else {
    return <ClusterDetailPage cluster={cluster} />;
  }
};

export default ClusterRoutes;
