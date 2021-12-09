import { HStack, TabPanel, TabPanels } from "@chakra-ui/react";
import * as React from "react";

import { Card, CardHeader } from "../../../components/card";
import {
  CardTab,
  CardTabs,
  CardTabsHeaders,
} from "../../../components/cardTabs";
import { TailscaleIntegration } from "./tailscale";
import { DeploymentIntegrationTabProps } from "./types";

export const DeploymentIntegrationsCard: React.FC<DeploymentIntegrationTabProps> =
  ({ deployment, refetch }) => {
    return (
      <Card>
        <CardTabs colorScheme="purple">
          <CardTabsHeaders>
            <CardHeader>Integrations</CardHeader>
            <HStack>
              <CardTab>Tailscale</CardTab>
              <CardTab>Datadog</CardTab>
            </HStack>
          </CardTabsHeaders>
          <TabPanels>
            <TabPanel>
              <TailscaleIntegration deployment={deployment} refetch={refetch} />
            </TabPanel>
            <TabPanel>Datadog integration coming soon.</TabPanel>
          </TabPanels>
        </CardTabs>
      </Card>
    );
  };
