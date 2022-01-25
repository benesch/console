import { HStack, Spacer } from "@chakra-ui/layout";
import { TabPanel, TabPanels } from "@chakra-ui/tabs";
import React from "react";

import { Deployment } from "../../../api/api";
import {
  Card,
  CardFooter,
  CardTab,
  CardTabs,
  CardTabsHeaders,
  CardTitle,
} from "../../../components/cardComponents";
import DeploymentLogsModal from "../DeploymentLogsModal";
import CpuMetrics from "./CpuMetrics";
import MemoryMetrics from "./MemoryMetrics";

const DeploymentMetricsCard: React.FC<{ deployment: Deployment }> = ({
  deployment,
}) => {
  return (
    <Card>
      <CardTabs data-testid="metrics-card" colorScheme="purple">
        <CardTabsHeaders>
          <CardTitle>Metrics</CardTitle>
          <HStack>
            <CardTab>Memory</CardTab>
            <CardTab>CPU</CardTab>
          </HStack>
        </CardTabsHeaders>
        <TabPanels>
          <TabPanel>
            <MemoryMetrics deploymentId={deployment.id} />
          </TabPanel>
          <TabPanel>
            <CpuMetrics deploymentId={deployment.id} />
          </TabPanel>
        </TabPanels>
      </CardTabs>
      <CardFooter>
        <Spacer />
        <DeploymentLogsModal deployment={deployment} size="sm" />
      </CardFooter>
    </Card>
  );
};

export default DeploymentMetricsCard;
