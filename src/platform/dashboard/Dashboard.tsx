import { HStack, VStack } from "@chakra-ui/react";
import React from "react";

import {
  PageBreadcrumbs,
  PageHeader,
  PageHeading,
} from "../../layouts/BaseLayout";
import MetricsCard from "./MetricsCard";

const Dashboard = () => {
  return (
    <>
      <PageBreadcrumbs />
      <PageHeader>
        <HStack spacing={4} alignItems="center" justifyContent="flex-start">
          <HStack>
            <PageHeading>Dashboard</PageHeading>
          </HStack>
        </HStack>
      </PageHeader>
      <VStack pb={6}>
        <MetricsCard />
      </VStack>
    </>
  );
};

export default Dashboard;
