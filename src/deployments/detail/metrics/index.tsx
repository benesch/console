import { Spacer } from "@chakra-ui/layout";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/tabs";
import React from "react";

import { Deployment } from "../../../api/api";
import { Card, CardFooter, CardHeader } from "../../../components/card";
import { DeploymentLogsButton } from "../deploymentLogsButton";
import { CpuMetrics } from "./CpuMetrics";
import { MemoryMetrics } from "./MemoryMetrics";

export const DeploymentMetricsCard: React.FC<{ deployment: Deployment }> = ({
  deployment,
}) => {
  return (
    <Card>
      <CardHeader>Metrics</CardHeader>
      <Tabs colorScheme="purple">
        <TabList px="4">
          <Tab>Memory</Tab>
          <Tab>vCPU</Tab>
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
      <CardFooter>
        <Spacer />
        <DeploymentLogsButton deployment={deployment} size="sm" />
      </CardFooter>
    </Card>
  );
};
