import { useInterval } from "@chakra-ui/react";
import React from "react";
import { Redirect, Route, useRouteMatch } from "react-router-dom";

import { useClusters } from "../../api/materialized";
import ClusterDetailPage from "./ClusterDetail";
import ClustersListPage from "./ClustersList";

export type ClusterDetailParams = {
  clusterName: string;
};

const ClusterRoutes = () => {
  const { path } = useRouteMatch();
  const { clusters, refetch } = useClusters();
  useInterval(refetch, 5000);
  return (
    <>
      <Route path={path} exact>
        <ClustersListPage clusters={clusters} />
      </Route>
      <Route
        path={`${path}/:clusterName/`}
        render={(props) => {
          const cluster = clusters?.find(
            (c) => c.name === props.match.params.clusterName
          );
          if (clusters && !cluster) {
            return <Redirect to={path} />;
          } else {
            return <ClusterDetailPage cluster={cluster} />;
          }
        }}
      />
    </>
  );
};

export default ClusterRoutes;
