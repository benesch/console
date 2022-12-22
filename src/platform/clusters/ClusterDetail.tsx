import { VStack } from "@chakra-ui/react";
import React from "react";
import { Route, Routes, useParams } from "react-router-dom";

import { Cluster } from "~/api/materialized";
import {
  PageBreadcrumbs,
  PageHeader,
  PageTab,
  PageTabStrip,
} from "~/layouts/BaseLayout";
import { ClusterDetailParams } from "~/platform/clusters/clusterRouter";

import ClusterOverview from "./ClusterOverview";
import ClusterReplicas from "./ClusterReplicas";

type Props = {
  cluster?: Cluster;
};

const ClusterDetailPage = ({ cluster }: Props) => {
  const { clusterName } = useParams<ClusterDetailParams>();

  return (
    <>
      <PageHeader>
        <VStack spacing={6} alignItems="start" width="100%">
          <PageBreadcrumbs crumbs={["Clusters", clusterName!]} />
          <PageTabStrip>
            <PageTab to={`/clusters/${clusterName}`} end>
              Overview
            </PageTab>
            <PageTab to={`/clusters/${clusterName}/replicas`}>Replicas</PageTab>
          </PageTabStrip>
        </VStack>
      </PageHeader>
      <Routes>
        <Route path="/" element={<ClusterOverview cluster={cluster} />} />
        <Route
          path="replicas"
          element={<ClusterReplicas cluster={cluster} />}
        />
      </Routes>
    </>
  );
};

export default ClusterDetailPage;
