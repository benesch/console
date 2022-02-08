import { HStack, VStack } from "@chakra-ui/react";
import React from "react";

import {
  BaseLayout,
  PageBreadcrumbs,
  PageHeader,
  PageHeading,
} from "../../layouts/BaseLayout";

const Dashboard = () => {
  return (
    <BaseLayout>
      <PageHeader>
        <HStack spacing={4} alignItems="center" justifyContent="flex-start">
          <HStack>
            <PageHeading>Dashboard</PageHeading>
          </HStack>
        </HStack>
      </PageHeader>
      <VStack>
        <div>hello world</div>
      </VStack>
    </BaseLayout>
  );
};

export default Dashboard;
