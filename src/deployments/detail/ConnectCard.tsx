/**
 * @module
 * Deployment connect instructions card.
 */

import {
  Button,
  HStack,
  Link,
  ListItem,
  OrderedList,
  Spacer,
  TabPanel,
  TabPanels,
  UnorderedList,
  Table, Th, Td, Text, Tbody, Tr,
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
                <Link textDecoration="underline" onClick={handleDownloadCerts}>
                  Download
                </Link>{" "}
                and unzip certificates.
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
        - ${deployment.hostname}:${deployment.port}
`}
                ></CodeBlock>
              </ListItem>
            </OrderedList>
          </TabPanel>
          <TabPanel>
            <Text pb="10px">
              To connect to this deployment using a{" "}
              <Link href="https://www.metabase.com/">Metabase</Link> client:
            </Text>
            <OrderedList ml="6" spacing="3">
              <ListItem>
                <Text>
                  Ensure Metabase runs on your local machine or on a machine you
                  control. This is necessary to support the certificate-based
                  authentication used by Materialize Cloud.
                </Text>
                <Text>
                  Follow the{" "}
                  <Link
                    href="https://www.metabase.com/docs/latest/operations-guide/installing-metabase.html"
                    textDecoration="underline"
                    isExternal
                  >
                    official installation instructions
                  </Link>{" "}
                  <ExternalLinkIcon /> to get Metabase set up.
                </Text>
              </ListItem>
              <ListItem>
                Click{" "}
                <Link onClick={handleDownloadCerts} textDecoration="underline">
                  Download certificates
                </Link>
                , below.
              </ListItem>
              <ListItem>
                Unzip the certificate ZIP file and ensure the directory is
                reachable by Metabase. Here we assume they got unpacked to{" "}
                <Text as="kbd">$PATH</Text>.
              </ListItem>
              <ListItem>
                In Metabase, create a new database with the following settings:
                <Table>
                  <Tbody>
                    <Tr>
                      <Th>Datatbase Type</Th>
                      <Td>PostgreSQL</Td>
                    </Tr>
                    <Tr>
                      <Th>Host</Th>
                      <Td>
                        <Text as="kbd">{deployment.hostname}</Text>
                      </Td>
                    </Tr>
                    <Tr>
                      <Th>Port</Th>
                      <Td>
                        <Text as="kbd">6875</Text>
                      </Td>
                    </Tr>
                    <Tr>
                      <Th>Database Name</Th>
                      <Td>
                        <Text as="kbd">materialize</Text>
                      </Td>
                    </Tr>
                    <Tr>
                      <Th>Username</Th>
                      <Td>
                        <Text as="kbd">materialize</Text>
                      </Td>
                    </Tr>
                    <Tr>
                      <Th>Password</Th>
                      <Td>(leave empty)</Td>
                    </Tr>
                    <Tr>
                      <Th>Use a secure connection (SSL)</Th>
                      <Td>(checked)</Td>
                    </Tr>
                    <Tr>
                      <Th>Additional JDBC connection string options</Th>
                      <Td>
                        <CodeBlock
                          wordBreak="break-all"
                          contents={`sslcert=$PATH/materialize.crt&sslkey=$PATH/materialize.der.key&sslrootcert=$PATH/ca.crt&sslmode=verify-full`}
                        />
                        replacing <Text as="kbd">$PATH</Text> with the location
                        where Metabase can reach your certificates.
                      </Td>
                    </Tr>
                  </Tbody>
                </Table>
              </ListItem>
            </OrderedList>
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
