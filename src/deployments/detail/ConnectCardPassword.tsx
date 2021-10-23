/**
 * @module
 * Deployment connect instructions card.
 */

import {
  ExternalLinkIcon,
  HStack,
  Link,
  ListItem,
  OrderedList,
  Table,
  TabPanel,
  TabPanels,
  Tbody,
  Td,
  Text,
  Th,
  Tr,
  UnorderedList,
} from "@chakra-ui/react";
import React from "react";

import { useAuth } from "../../api/auth";
import { Deployment } from "../../api/backend";
import {
  Card,
  CardTab,
  CardTabs,
  CardTabsHeaders,
  CardTitle,
} from "../../components/cardComponents";
import CodeBlock from "../../components/CodeBlock";
import { CopyableText } from "../../components/Copyable";

interface DeploymentConnectCardProps {
  deployment: Deployment;
}

const ConnectCardPassword = ({ deployment }: DeploymentConnectCardProps) => {
  const { fetchAuthed, user } = useAuth();

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
                <Link href="/access" textDecoration="underline">
                  Generate an app-specific password
                </Link>{" "}
                if you do not yet have one, and set the <code>PGPASSWORD</code>{" "}
                environment variable to the password you generated.
              </ListItem>
              <ListItem>
                Open a terminal and run psql:
                <CodeBlock
                  contents={`psql "postgresql://${encodeURIComponent(
                    user.email
                  )}@${deployment.hostname}:${
                    deployment.port
                  }/materialize?sslmode=verify-full&sslrootcert=/etc/ssl/certs/ca-certificates.crt"`}
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
                <Link href="/access" textDecoration="underline">
                  Generate an app-specific password
                </Link>{" "}
                for prometheus.
              </ListItem>
              <ListItem>
                Add the following configuration to <code>prometheus.yml</code>:
                <CodeBlock
                  contents={`scrape_configs:
  - job_name: materialize-cloud-${deployment.name}
    scheme: https
    basic_auth:
      username: ${user.email}
      password: PASSWORD # The app-specific password you generated above
      # Or use "password_file" to keep the password out of your configuration
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
    </Card>
  );
};

export default ConnectCardPassword;
