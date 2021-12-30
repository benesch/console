import { Spacer } from "@chakra-ui/layout";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/tabs";
import React from "react";

import { Deployment } from "../../../api/api";
import {
  Card,
  CardFooter,
  CardHeader,
} from "../../../components/cardComponents";
import DeploymentLogsModal from "../DeploymentLogsModal";
import CpuMetrics from "./CpuMetrics";
import MemoryMetrics from "./MemoryMetrics";

export const DeploymentMetricsTabs: React.FC<{ deployment: Deployment }> = ({
  deployment,
}) => {
  return (
    <Tabs colorScheme="purple">
      <TabList px="4">
        <Tab>Memory</Tab>
        <Tab>CPU</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <MemoryMetrics deploymentId={deployment.id} />
        </TabPanel>
        <TabPanel>
          <CpuMetrics deploymentId={deployment.id} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export const DeploymentMetricsCard: React.FC<{ deployment: Deployment }> = ({
  deployment,
}) => {
  return (
    <Card data-testid="metrics-card">
      <CardHeader>Metrics</CardHeader>
      <DeploymentMetricsTabs deployment={deployment} />
      <CardFooter>
        <Spacer />
        <DeploymentLogsModal deployment={deployment} size="sm" />
      </CardFooter>
    </Card>
  );
};
