import { VStack } from "@chakra-ui/react";
import React from "react";
import { Route, useParams } from "react-router-dom";

import ConnectModal from "~/components/ConnectModal";
import {
  Breadcrumb,
  PageBreadcrumbs,
  PageHeader,
  PageTab,
  PageTabStrip,
} from "~/layouts/BaseLayout";
import { ClusterDetailParams } from "~/platform/clusters/ClusterRoutes";
import { SentryRoutes } from "~/sentry";

import ClusterOverview from "./ClusterOverview";
import ClusterReplicas from "./ClusterReplicas";
import Indexes from "./Indexes";
import MaterializedViews from "./MaterializedViews";

const ClusterDetailPage = () => {
  const { clusterName } = useParams<ClusterDetailParams>();

  const breadcrumbs: Breadcrumb[] = React.useMemo(
    () => [{ title: "Clusters", href: ".." }, { title: clusterName ?? "" }],
    [clusterName]
  );

  return (
    <>
      <PageHeader>
        <VStack spacing={6} alignItems="start" width="100%">
          <PageBreadcrumbs crumbs={breadcrumbs} />
          <PageTabStrip>
            <PageTab to="." end>
              Overview
            </PageTab>
            <PageTab to="replicas">Replicas</PageTab>
            <PageTab to="materialized-views">Materialized Views</PageTab>
            <PageTab to="indexes">Indexes</PageTab>
          </PageTabStrip>
        </VStack>
        <ConnectModal />
      </PageHeader>
      <SentryRoutes>
        <Route path="/" element={<ClusterOverview />} />
        <Route path="replicas" element={<ClusterReplicas />} />
        <Route path="materialized-views" element={<MaterializedViews />} />
        <Route path="indexes/*" element={<Indexes />} />
      </SentryRoutes>
    </>
  );
};

export default ClusterDetailPage;
