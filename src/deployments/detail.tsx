/**
 * @module
 * Deployment detail view.
 */

import {
  Alert,
  AlertIcon,
  Button,
  ButtonProps,
  Checkbox,
  Heading,
  HStack,
  ListItem,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  OrderedList,
  Spacer,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  UnorderedList,
  useDisclosure,
  useInterval,
  VStack,
} from "@chakra-ui/react";
import download from "downloadjs";
import React from "react";
import { Link, useParams } from "react-router-dom";

import {
  Deployment,
  useDeploymentsLogsRetrieve,
  useDeploymentsRetrieve,
  useMzVersionsLatestRetrieve,
} from "../api/api";
import { useAuthedFetch } from "../api/fetch";
import {
  Card,
  CardContent,
  CardField,
  CardFooter,
  CardHeader,
} from "../components/card";
import { CodeBlock } from "../components/codeblock";
import {
  BaseLayout,
  PageBreadcrumbs,
  PageHeader,
  PageHeading,
} from "../layouts/base";
import { DestroyDeploymentButton } from "./destroy";
import { UpdateDeploymentButton } from "./update";
import { UpgradeDeploymentButton } from "./upgrade";
import { DeploymentStateBadge } from "./util";

export function DeploymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: deployment, error, refetch } = useDeploymentsRetrieve({ id });
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
        <Link to="/deployments">Deployments</Link> /
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
        <UpdateDeploymentButton
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
          <DeploymentConnectCard deployment={deployment} />
          <DeploymentIntegrationsCard deployment={deployment} />
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

interface DeploymentConnectCardProps {
  deployment: Deployment;
}

function DeploymentConnectCard({ deployment }: DeploymentConnectCardProps) {
  const { fetchAuthed } = useAuthedFetch();
  const handleDownloadCerts = async () => {
    const response = await fetchAuthed(
      `/api/deployments/${deployment.id}/certs`
    );
    const blob = await response.blob();
    download(blob, `${deployment.name}-certs.zip`, "application/zip");
  };

  return (
    <Card>
      <CardHeader>Connect</CardHeader>
      <Tabs colorScheme="purple">
        <TabList px="4">
          <Tab>psql</Tab>
          <Tab>Prometheus</Tab>
          <Tab>Metabase</Tab>
        </TabList>
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
              <ListItem>Download and unzip certificates.</ListItem>
              <ListItem>
                Open a terminal and run psql from the directory containing the
                certificates:
                <CodeBlock
                  contents={`psql "postgresql://materialize@${deployment.hostname}:6875/materialize?sslmode=require&sslcert=materialize.crt&sslkey=materialize.key&sslrootcert=ca.crt"`}
                ></CodeBlock>
              </ListItem>
            </OrderedList>
          </TabPanel>
          <TabPanel>
            <OrderedList ml="6" spacing="3">
              <ListItem>
                Download and unzip certificates in a location that is accessible
                to your Prometheus deployment.
              </ListItem>
              <ListItem>
                Add the following configuration to <code>prometheus.yml</code>:
                <CodeBlock
                  contents={`scrape_configs:
  - job_name: materialized
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
      </Tabs>
      <CardFooter>
        <Spacer />
        <Button colorScheme="purple" size="sm" onClick={handleDownloadCerts}>
          Download certificates
        </Button>
      </CardFooter>
    </Card>
  );
}

interface DeploymentIntegrationsCardProps {
  deployment: Deployment;
}

function DeploymentIntegrationsCard(_: DeploymentIntegrationsCardProps) {
  return (
    <Card>
      <CardHeader>Integrations</CardHeader>
      <Tabs colorScheme="purple">
        <TabList px="4">
          <Tab>Tailscale</Tab>
          <Tab>Datadog</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Tailscale integration coming soon.</TabPanel>
          <TabPanel>Datadog integration coming soon.</TabPanel>
        </TabPanels>
      </Tabs>
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
          <CardField name="Hostname">{deployment.hostname}</CardField>
          <CardField name="Version">{deployment.mzVersion}</CardField>
          <CardField name="Size">{deployment.size}</CardField>
          <CardField name="Cloud provider">AWS</CardField>
          <CardField name="Region">us-east-1</CardField>
          <CardField name="Cluster ID">{deployment.clusterId || "-"}</CardField>
        </VStack>
      </CardContent>
      <CardFooter>
        <Spacer />
        <DeploymentLogsButton deployment={deployment} size="sm" />
      </CardFooter>
    </Card>
  );
}

interface DeploymentLogsButtonProps extends ButtonProps {
  deployment: Deployment;
}

function DeploymentLogsButton({
  deployment,
  ...props
}: DeploymentLogsButtonProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { fetchAuthed } = useAuthedFetch();
  const { loading, data, refetch } = useDeploymentsLogsRetrieve({
    id: deployment.id,
  });
  const [wrap, setWrap] = React.useState(false);

  const downloadLogs = async () => {
    const response = await fetchAuthed(
      `/api/deployments/${deployment.id}/logs`
    );
    const blob = await response.blob();
    download(blob, `${deployment.name}.log`, "text/plain");
  };

  let logs;
  if (data) {
    logs = (
      <CodeBlock
        contents={data}
        wrap={wrap}
        lineNumbers={true}
        fontSize="sm"
        my="0"
      />
    );
  } else {
    logs = <Text p="5">No logs yet.</Text>;
  }

  return (
    <>
      <Button onClick={onOpen} {...props}>
        View logs
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="5xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Logs</ModalHeader>
          <ModalCloseButton />
          {logs}
          <ModalFooter>
            <HStack flex="1">
              <Checkbox
                onChange={(e) => setWrap(e.target.checked)}
                isChecked={wrap}
              >
                Wrap lines
              </Checkbox>
              <Spacer />
              <Button isLoading={loading} onClick={() => refetch()} size="sm">
                Refresh
              </Button>
              <Button onClick={downloadLogs} colorScheme="purple" size="sm">
                Download
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
