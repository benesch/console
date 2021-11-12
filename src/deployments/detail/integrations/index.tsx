import {
  Flex,
  HStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import * as React from "react";

import { Deployment } from "../../../api/api";
import { useAuth } from "../../../api/auth";
import { Card, CardHeader } from "../../../components/card";
import { TailscaleIntegration } from "./tailscale";

interface DeploymentIntegrationsCardProps {
  deployment: Deployment;
}

export const DeploymentIntegrationsCard: React.FC<DeploymentIntegrationsCardProps> =
  ({ deployment }) => {
    const a = useAuth();
    console.log(a);
    return (
      <Card>
        <Tabs colorScheme="purple">
          <TabList
            as={Flex}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            px="2"
          >
            <CardHeader>Integrations</CardHeader>
            <HStack>
              <Tab py={4}>Tailscale</Tab>
              <Tab py={4}>Datadog</Tab>
            </HStack>
          </TabList>
          <TabPanels>
            <TabPanel>
              <TailscaleIntegration />
            </TabPanel>
            <TabPanel>Datadog integration coming soon.</TabPanel>
          </TabPanels>
        </Tabs>
      </Card>
    );
  };
