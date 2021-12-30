import { HStack, TabPanel, TabPanels } from "@chakra-ui/react";
import * as React from "react";

import {
  Card,
  CardHeader,
  CardTab,
  CardTabs,
  CardTabsHeaders,
} from "../../../components/cardComponents";
import TailscaleIntegration from "./tailscale/TailscaleIntegration";
import { DeploymentIntegrationTabProps } from "./types";

const DeploymentIntegrationsCard: React.FC<DeploymentIntegrationTabProps> = ({
  deployment,
  refetch,
}) => {
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

export default DeploymentIntegrationsCard;
