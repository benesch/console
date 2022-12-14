import { HStack, Spacer, Text, useTheme, VStack } from "@chakra-ui/react";
import React from "react";
import { useRecoilValue } from "recoil";

import { PageHeader, PageHeading } from "~/layouts/BaseLayout";
import { currentEnvironmentIdState } from "~/recoil/environments";

const Dashboard = () => {
  const { colors } = useTheme();
  const currentEnvironmentId = useRecoilValue(currentEnvironmentIdState);
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
          <Text
            fontSize="md"
            textColor={colors.semanticColors.foreground.secondary}
          >
            {currentEnvironmentId}
          </Text>
        </VStack>
        <Spacer />
      </HStack>
    </PageHeader>
  );
};

export default Dashboard;
