/**
 * @module
 * Deployment connect instructions card.
 */

import {
  Button,
  HStack,
  ListItem,
  OrderedList,
  Spacer,
  TabPanel,
  TabPanels,
  UnorderedList,
} from "@chakra-ui/react";
import download from "downloadjs";
import React from "react";

import { useAuth } from "../../api/auth";
import { Deployment } from "../../api/backend";
import {
  Card,
  CardFooter,
  CardTab,
  CardTabs,
  CardTabsHeaders,
  CardTitle,
} from "../../components/cardComponents";
import CodeBlock from "../../components/CodeBlock";
import TextLink from "../../components/TextLink";

interface DeploymentConnectCardProps {
  deployment: Deployment;
}

const ConnectCard = ({ deployment }: DeploymentConnectCardProps) => {
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
          <CardTitle>Connect</CardTitle>
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
                <TextLink onClick={handleDownloadCerts}>Download</TextLink> and
                unzip certificates.
              </ListItem>
              <ListItem>
                Open a terminal and run psql from the directory containing the
                certificates:
                <CodeBlock
                  contents={`psql "postgresql://materialize@${deployment.hostname}:${deployment.port}/materialize?sslmode=verify-full&sslcert=materialize.crt&sslkey=materialize.key&sslrootcert=ca.crt"`}
                ></CodeBlock>
              </ListItem>
              <ListItem>
                If this is your first time using Materialize, check out{" "}
                <TextLink href="https://materialize.com/docs/cloud/get-started-with-cloud/">
                  our getting started guide
                </TextLink>
                !
              </ListItem>
            </OrderedList>
          </TabPanel>
          <TabPanel>
            <OrderedList ml="6" spacing="3">
              <ListItem>
                <TextLink onClick={handleDownloadCerts}>Download</TextLink> and
                unzip certificates in a location that is accessible to your
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
        - ${deployment.hostname}:${deployment.port}
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
};

export default ConnectCard;
