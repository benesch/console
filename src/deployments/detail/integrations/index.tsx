import { HStack, TabPanel, TabPanels } from "@chakra-ui/react";
import * as React from "react";

import { Card, CardHeader } from "../../../components/card";
import { CardTab, CardTabList, CardTabs } from "../../../components/cardTabs";
import { TailscaleIntegration } from "./tailscale";

export const DeploymentIntegrationsCard: React.FC = () => {
  return (
    <Card>
      <CardTabs colorScheme="purple">
        <CardTabList>
          <CardHeader>Integrations</CardHeader>
          <HStack>
            <CardTab py={4}>Tailscale</CardTab>
            <CardTab py={4}>Datadog</CardTab>
          </HStack>
        </CardTabList>
        <TabPanels>
          <TabPanel>
            <TailscaleIntegration />
          </TabPanel>
          <TabPanel>Datadog integration coming soon.</TabPanel>
        </TabPanels>
      </CardTabs>
    </Card>
  );
};
