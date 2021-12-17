/**
 * @module
 * Deployment detail view.
 */

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Heading,
  HStack,
  Link,
  ListItem,
  OrderedList,
  Spacer,
  Spinner,
  TabPanel,
  TabPanels,
  UnorderedList,
  useInterval,
  VStack,
} from "@chakra-ui/react";
import download from "downloadjs";
import React from "react";
import { Link as RouterLink, useParams } from "react-router-dom";

import {
  Deployment,
  useDeploymentsRetrieve,
  useMzVersionsLatestRetrieve,
} from "../../api/api";
import { useAuth } from "../../api/auth";
import {
  Card,
  CardContent,
  CardField,
  CardFooter,
  CardHeader,
} from "../../components/card";
import { CardTab, CardTabs, CardTabsHeaders } from "../../components/cardTabs";
import { CodeBlock } from "../../components/codeblock";
import { CopyableText } from "../../components/Copyable";
import {
  BaseLayout,
  PageBreadcrumbs,
  PageHeader,
  PageHeading,
} from "../../layouts/base";
import { DestroyDeploymentButton } from "../destroy";
import { EditDeploymentButton } from "../edit";
import { UpgradeDeploymentButton } from "../upgrade";
import { DeploymentStateBadge } from "../util";
import { DeploymentIntegrationsCard } from "./integrations";
import { DeploymentMetricsCard } from "./metrics";

export function DeploymentDetailPage() {
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
      <DeploymentDetail
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
}

interface DeploymentNotFoundProps {
  id: string;
}

function DeploymentNotFound(props: DeploymentNotFoundProps) {
  return (
    <>
      <Heading fontWeight="400" fontSize="2xl" mb="5">
        Unknown
      </Heading>
      <p>
        The deployment with ID "{props.id}" is unknown. Perhaps it was recently
        deleted.
      </p>
    </>
  );
}

interface DeploymentDetailProps {
  deployment: Deployment;
  latestVersion: string;
  refetch: () => Promise<void>;
}

function DeploymentDetail({
  deployment,
  latestVersion,
  refetch,
}: DeploymentDetailProps) {
  return (
    <>
      <PageHeader>
        <PageHeading>{deployment.name}</PageHeading>
        {deployment.flaggedForUpdate && <Spinner />}
        <Spacer />
        <EditDeploymentButton
          deployment={deployment}
          refetch={refetch}
          size="sm"
        />
        <DestroyDeploymentButton deployment={deployment} size="sm" />
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
          <DeploymentConnectCard deployment={deployment} />
          <DeploymentIntegrationsCard
            deployment={deployment}
            refetch={refetch}
          />
          <DeploymentMetricsCard deployment={deployment} />
        </VStack>
        <VStack width="400px">
          <DeploymentDetailCard deployment={deployment} />
        </VStack>
      </HStack>
    </>
  );
}

interface DeploymentUpgradeAlert {
  deployment: Deployment;
  latestVersion: string;
  refetch: () => Promise<void>;
}

function DeploymentUpgradeAlert({
  deployment,
  latestVersion,
  refetch,
}: DeploymentUpgradeAlert) {
  return (
    <Alert>
      <AlertIcon />
      An automatic upgrade to {latestVersion} is pending.
      <Spacer />
      <UpgradeDeploymentButton
        deployment={deployment}
        latestVersion={latestVersion}
        refetch={refetch}
        size="sm"
      />
    </Alert>
  );
}

function UserIndexesDisabledAlert() {
  return (
    <Alert status="info">
      <AlertIcon />
      <AlertTitle mr={2}>User indexes are disabled</AlertTitle>
      <AlertDescription>
        Your deployment is healthy, but in "disable user indexes" mode no data
        will be ingested. You can connect to your Materialize deployment to
        debug OOM or other crash loops.
      </AlertDescription>
    </Alert>
  );
}

interface DeploymentConnectCardProps {
  deployment: Deployment;
}

function DeploymentConnectCard({ deployment }: DeploymentConnectCardProps) {
  const { fetchAuthed } = useAuth();
  const handleDownloadCerts = async () => {
    const response = await fetchAuthed(
      `/api/deployments/${deployment.id}/certs`
    );
    const blob = await response.blob();
    download(blob, `${deployment.name}-certs.zip`, "application/zip");
  };

  return (
    <Card>
      <CardTabs colorScheme="purple">
        <CardTabsHeaders>
          <CardHeader>Connect</CardHeader>
          <HStack>
            <CardTab>psql</CardTab>
            <CardTab>Prometheus</CardTab>
            <CardTab>Metabase</CardTab>
          </HStack>
        </CardTabsHeaders>
        <TabPanels fontSize="15px">
          <TabPanel>
            <OrderedList ml="6" spacing="3">
              <ListItem>
                Install psql.
                <UnorderedList>
                  <ListItem>
                    On macOS: <code>brew install postgresql</code>
                  </ListItem>
                  <ListItem>
                    On Debian/Ubuntu:{" "}
                    <code>sudo apt install postgresql-client</code>
                  </ListItem>
                </UnorderedList>
              </ListItem>
              <ListItem>
                <Link textDecoration="underline" onClick={handleDownloadCerts}>
                  Download
                </Link>{" "}
                and unzip certificates.
              </ListItem>
              <ListItem>
                Open a terminal and run psql from the directory containing the
                certificates:
                <CodeBlock
                  contents={`psql "postgresql://materialize@${deployment.hostname}:6875/materialize?sslmode=require&sslcert=materialize.crt&sslkey=materialize.key&sslrootcert=ca.crt"`}
                ></CodeBlock>
              </ListItem>
              <ListItem>
                If this is your first time using Materialize, check out{" "}
                <Link
                  href="https://materialize.com/docs/cloud/get-started-with-cloud/"
                  textDecoration="underline"
                >
                  our getting started guide
                </Link>
                !
              </ListItem>
            </OrderedList>
          </TabPanel>
          <TabPanel>
            <OrderedList ml="6" spacing="3">
              <ListItem>
                <Link textDecoration="underline" onClick={handleDownloadCerts}>
                  Download
                </Link>{" "}
                and unzip certificates in a location that is accessible to your
                Prometheus deployment.
              </ListItem>
              <ListItem>
                Add the following configuration to <code>prometheus.yml</code>:
                <CodeBlock
                  contents={`scrape_configs:
  - job_name: materialize-cloud-${deployment.name}
    scheme: https
    tls_config:
      ca_file: ca.crt
      cert_file: materialize.crt
      key_file: materialize.key
    static_configs:
      - targets:
        - ${deployment.hostname}:6875
`}
                ></CodeBlock>
              </ListItem>
            </OrderedList>
          </TabPanel>
          <TabPanel>
            <p>Metabase connection instructions coming soon.</p>
          </TabPanel>
        </TabPanels>
      </CardTabs>
      <CardFooter>
        <Spacer />
        <Button colorScheme="purple" size="sm" onClick={handleDownloadCerts}>
          Download certificates
        </Button>
      </CardFooter>
    </Card>
  );
}

interface DeploymentDetailCardProps {
  deployment: Deployment;
}

function DeploymentDetailCard({ deployment }: DeploymentDetailCardProps) {
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
}
