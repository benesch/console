import { Spacer } from "@chakra-ui/layout";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/tabs";
import React from "react";

import { Deployment } from "../../../api/api";
import { Card, CardFooter, CardHeader } from "../../../components/card";
import { DeploymentLogsButton } from "../deploymentLogsButton";
import { DeploymentMetricsNotAvailableError } from "./components/DeploymentMetricsNotAvailableError";
import { CpuMetrics } from "./CpuMetrics";
import { isSupportedRegionForMetrics } from "./hooks";
import { MemoryMetrics } from "./MemoryMetrics";

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
  const metricsFragment = isSupportedRegionForMetrics(deployment) ? (
    <DeploymentMetricsTabs deployment={deployment} />
  ) : (
    <DeploymentMetricsNotAvailableError />
  );
  return (
    <Card data-testid="metrics-card">
      <CardHeader>Metrics</CardHeader>
      {metricsFragment}
      <CardFooter>
        <Spacer />
        <DeploymentLogsButton deployment={deployment} size="sm" />
      </CardFooter>
    </Card>
  );
};
