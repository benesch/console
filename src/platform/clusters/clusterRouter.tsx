import { useInterval } from "@chakra-ui/react";
import React from "react";
import { Navigate, Route, useParams } from "react-router-dom";

import { SentryRoutes } from "~/.";
import { Cluster, useClusters } from "~/api/materialized";
import ClusterDetailPage from "~/platform/clusters/ClusterDetail";
import ClustersListPage from "~/platform/clusters/ClustersList";
import { isPollingDisabled } from "~/util";

export type ClusterDetailParams = {
  clusterName: string;
};

const ClusterRoutes = () => {
  const clusterResponse = useClusters();
  useInterval(clusterResponse.refetch, isPollingDisabled() ? null : 5000);

  return (
    <SentryRoutes>
      <Route
        path="/"
        element={<ClustersListPage clusterResponse={clusterResponse} />}
      />
      <Route
        path=":clusterName/*"
        element={<ClusterOrRedirect clusters={clusterResponse.data} />}
      />
    </SentryRoutes>
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
