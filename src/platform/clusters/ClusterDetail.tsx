import { VStack } from "@chakra-ui/react";
import React from "react";
import { Route, useParams } from "react-router-dom";

import { Cluster } from "~/api/materialized";
import {
  Breadcrumb,
  PageBreadcrumbs,
  PageHeader,
  PageTab,
  PageTabStrip,
} from "~/layouts/BaseLayout";
import { ClusterDetailParams } from "~/platform/clusters/ClusterRoutes";
import { useRegionSlug } from "~/region";
import { SentryRoutes } from "~/sentry";

import ClusterOverview from "./ClusterOverview";
import ClusterReplicas from "./ClusterReplicas";

type Props = {
  cluster?: Cluster;
};

const ClusterDetailPage = ({ cluster }: Props) => {
  const { regionId, clusterName } = useParams<ClusterDetailParams>();
  const regionSlug = useRegionSlug();

  const breadcrumbs: Breadcrumb[] = React.useMemo(
    () => [
      { title: "Clusters", href: `${regionSlug}/clusters` },
      { title: clusterName ?? "" },
    ],
    [clusterName, regionSlug]
  );

  return (
    <>
      <PageHeader>
        <VStack spacing={6} alignItems="start" width="100%">
          <PageBreadcrumbs crumbs={breadcrumbs} />
          <PageTabStrip>
            <PageTab to={`/${regionId}/clusters/${clusterName}`} end>
              Overview
            </PageTab>
            <PageTab to={`/${regionId}/clusters/${clusterName}/replicas`}>
              Replicas
            </PageTab>
          </PageTabStrip>
        </VStack>
      </PageHeader>
      <SentryRoutes>
        <Route path="/" element={<ClusterOverview cluster={cluster} />} />
        <Route
          path="replicas"
          element={<ClusterReplicas cluster={cluster} />}
        />
      </SentryRoutes>
    </>
  );
};

export default ClusterDetailPage;
