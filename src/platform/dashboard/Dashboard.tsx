import { HStack, Text, useColorModeValue, VStack } from "@chakra-ui/react";
import React from "react";
import { useRecoilState } from "recoil";

import {
  PageBreadcrumbs,
  PageHeader,
  PageHeading,
} from "../../layouts/BaseLayout";
import { currentEnvironment } from "../../recoil/currentEnvironment";
import MetricsCard from "./MetricsCard";

const Dashboard = () => {
  const [current, _] = useRecoilState(currentEnvironment);
  const grayText = useColorModeValue("gray.600", "gray.200");
  return (
    <>
      <PageBreadcrumbs />
      <PageHeader>
        <HStack spacing={4} alignItems="center" justifyContent="flex-start">
          <VStack alignItems="flex-start">
            <PageHeading>Dashboard</PageHeading>
            <Text fontSize="md" textColor={grayText}>
              {current
                ? `${current?.provider}/${current?.region}`
                : "No region active"}
            </Text>
          </VStack>
        </HStack>
      </PageHeader>
      <VStack pb={6}>
        <MetricsCard />
      </VStack>
    </>
  );
};

export default Dashboard;
