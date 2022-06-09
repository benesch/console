/**
 * @module
 * Deployment connect instructions card.
 */

import {
  HStack,
  ListItem,
  OrderedList,
  TabPanel,
  TabPanels,
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
import TextLink from "../../components/TextLink";

interface DeploymentConnectCardProps {
  deployment: Deployment;
}

const ConnectCardPassword = ({ deployment }: DeploymentConnectCardProps) => {
  const { user } = useAuth();

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
                <TextLink href="/access">
                  Generate an app-specific password
                </TextLink>{" "}
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
                <TextLink href="/access">
                  Generate an app-specific password
                </TextLink>{" "}
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
            <p>Metabase connection instructions coming soon.</p>
          </TabPanel>
        </TabPanels>
      </CardTabs>
    </Card>
  );
};

export default ConnectCardPassword;
