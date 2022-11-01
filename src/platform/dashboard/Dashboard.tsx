import {
  HStack,
  Spacer,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { useRecoilValue } from "recoil";

import { PageHeader, PageHeading } from "../../layouts/BaseLayout";
import { currentEnvironmentIdState } from "../../recoil/environments";

const Dashboard = () => {
  const currentEnvironmentId = useRecoilValue(currentEnvironmentIdState);
  const grayText = useColorModeValue("gray.600", "gray.200");
  return (
    <PageHeader>
      <HStack
        spacing={4}
        alignItems="center"
        justifyContent="flex-start"
        width="100%"
      >
        <VStack alignItems="flex-start">
          <PageHeading>Dashboard</PageHeading>
          <Text fontSize="md" textColor={grayText}>
            {currentEnvironmentId}
          </Text>
        </VStack>
        <Spacer />
      </HStack>
    </PageHeader>
  );
};

export default Dashboard;
