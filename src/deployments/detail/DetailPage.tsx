/**
 * @module
 * Deployment detail view.
 */

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Heading,
  HStack,
  Spacer,
  Spinner,
  useInterval,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { Link as RouterLink, useParams } from "react-router-dom";

import {
  Deployment,
  useDeploymentsRetrieve,
  useMzVersionsLatestRetrieve,
} from "../../api/api";
import {
  Card,
  CardContent,
  CardField,
  CardHeader,
} from "../../components/cardComponents";
import { CopyableText } from "../../components/Copyable";
import {
  BaseLayout,
  PageBreadcrumbs,
  PageHeader,
  PageHeading,
} from "../../layouts/BaseLayout";
import DeploymentStateBadge from "../DeploymentStateBadge";
import DestroyDeploymentModal from "../DestroyModal";
import EditDeploymentModal from "../EditModal";
import UpgradeDeploymentModal from "../UpgradeModal";
import ConnectCard from "./ConnectCard";
import DeploymentIntegrationsCard from "./integrations/DeploymentIntegrationsCard";
import { DeploymentMetricsCard } from "./metrics";

const DetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const {
    data: deployment,
    refetch,

    error,
  } = useDeploymentsRetrieve({ id });
  const { data: latestVersion } = useMzVersionsLatestRetrieve({});
  useInterval(refetch, 5000);

  let deploymentView;
  if (error?.status === 404) {
    deploymentView = <DeploymentNotFound id={id} />;
  } else if (deployment === null || latestVersion === null) {
    deploymentView = (
      <PageHeader>
        <Spinner />
      </PageHeader>
    );
  } else {
    deploymentView = (
      <DetailContent
        deployment={deployment}
        latestVersion={latestVersion}
        refetch={refetch}
      />
    );
  }

  return (
    <BaseLayout>
      <PageBreadcrumbs>
        <RouterLink to="/deployments">Deployments</RouterLink> /
      </PageBreadcrumbs>
      {deploymentView}
    </BaseLayout>
  );
};

interface DetailContentProps {
  deployment: Deployment;
  latestVersion: string;
  refetch: () => Promise<Deployment | null>;
}

const DetailContent = ({
  deployment,
  latestVersion,
  refetch,
}: DetailContentProps) => {
  return (
    <>
      <PageHeader>
        <PageHeading>{deployment.name}</PageHeading>
        {deployment.flaggedForUpdate && <Spinner />}
        <Spacer />
        <EditDeploymentModal
          deployment={deployment}
          refetch={refetch}
          size="sm"
        />
        <DestroyDeploymentModal deployment={deployment} size="sm" />
      </PageHeader>
      <HStack display="flex" spacing="5" alignItems="top">
        <VStack flex="1" spacing="5" minWidth="0">
          {deployment.mzVersion !== latestVersion && (
            <DeploymentUpgradeAlert
              deployment={deployment}
              latestVersion={latestVersion}
              refetch={refetch}
            />
          )}
          {deployment.disableUserIndexes && deployment.status === "OK" && (
            <UserIndexesDisabledAlert />
          )}
          <ConnectCard deployment={deployment} />
          <DeploymentIntegrationsCard
            deployment={deployment}
            refetch={refetch}
          />
          <DeploymentMetricsCard deployment={deployment} />
        </VStack>
        <VStack width="400px">
          <DetailCard deployment={deployment} />
        </VStack>
      </HStack>
    </>
  );
};

interface DeploymentNotFoundProps {
  id: string;
}

const DeploymentNotFound = (props: DeploymentNotFoundProps) => {
  return (
    <>
      <Heading fontWeight="400" fontSize="2xl" mb="5">
        Unknown
      </Heading>
      <p>
        The deployment with ID &quot;{props.id}&quot; is unknown. Perhaps it was
        recently deleted.
      </p>
    </>
  );
};

interface DeploymentUpgradeAlert {
  deployment: Deployment;
  latestVersion: string;
  refetch: () => Promise<Deployment | null>;
}

const DeploymentUpgradeAlert = ({
  deployment,
  latestVersion,
  refetch,
}: DeploymentUpgradeAlert) => {
  return (
    <Alert>
      <AlertIcon />
      An automatic upgrade to {latestVersion} is pending.
      <Spacer />
      <UpgradeDeploymentModal
        deployment={deployment}
        latestVersion={latestVersion}
        refetch={refetch}
        size="sm"
      />
    </Alert>
  );
};

const UserIndexesDisabledAlert = () => {
  return (
    <Alert status="info">
      <AlertIcon />
      <AlertTitle mr={2}>User indexes are disabled</AlertTitle>
      <AlertDescription>
        Your deployment is healthy, but in &quot;disable user indexes&quot; mode
        no data will be ingested. You can connect to your Materialize deployment
        to debug OOM or other crash loops.
      </AlertDescription>
    </Alert>
  );
};

interface DetailCardProps {
  deployment: Deployment;
}

const DetailCard = ({ deployment }: DetailCardProps) => {
  return (
    <Card>
      <CardHeader>Details</CardHeader>
      <CardContent>
        <VStack spacing="3" align="left">
          <CardField name="Name">{deployment.name}</CardField>
          <CardField name="Status">
            <DeploymentStateBadge deployment={deployment} />
          </CardField>
          <CardField name="Hostname">
            <CopyableText>{deployment.hostname ?? ""}</CopyableText>
          </CardField>
          <CardField name="Version">{deployment.mzVersion}</CardField>
          <CardField name="Size">{deployment.size}</CardField>
          <CardField name="Cloud provider">
            {deployment.cloudProviderRegion.provider}
          </CardField>
          <CardField name="Region">
            {deployment.cloudProviderRegion.region}
          </CardField>
          <CardField name="Cluster ID">{deployment.clusterId || "-"}</CardField>
        </VStack>
      </CardContent>
    </Card>
  );
};

export default DetailPage;
