import { HStack, VStack } from "@chakra-ui/react";
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
        <VStack spacing={4} alignItems="start" width="100%">
          <HStack justifyContent="space-between" width="100%">
            <PageBreadcrumbs crumbs={breadcrumbs} />
            <ConnectModal />
          </HStack>
          <PageTabStrip
            tabData={[
              { label: "Overview", href: "." },
              { label: "Replicas", href: "replicas" },
              { label: "Materialized Views", href: "materialized-views" },
              { label: "Indexes", href: "indexes" },
            ]}
          />
        </VStack>
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
