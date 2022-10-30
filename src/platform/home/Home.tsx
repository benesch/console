import { Box, HStack, Spinner, Text, VStack } from "@chakra-ui/react";
import React from "react";
import { useRecoilValue } from "recoil";

import { Card, CardContent, CardHeader } from "../../components/cardComponents";
import { PageBreadcrumbs, PageHeader } from "../../layouts/BaseLayout";
import {
  currentEnvironmentIdState,
  loadedEnvironmentsState,
} from "../../recoil/environments";
import CreateEnvironmentButton from "../tutorial/CreateEnvironmentButton";
import EnvironmentList from "../tutorial/EnvironmentList";
import ConnectSteps from "./ConnectSteps";
import GetStartedDocs from "./GetStartedDocs";
import PasswordStep from "./PasswordStep";
import RegionCrashed from "./RegionCrashed";
import StepsWhileLoading from "./StepsWhileLoading";

const Home = () => {
  const environments = useRecoilValue(loadedEnvironmentsState);
  const currentEnvironmentId = useRecoilValue(currentEnvironmentIdState);

  let content = (
    <HStack justifyContent="flex-start" width="100%">
      <Spinner />
    </HStack>
  );

  if (environments) {
    if (
      Array.from(environments.values()).every((e) => e.state === "disabled")
    ) {
      content = (
        <Box textAlign="center">
          <VStack mb={4} spacing={2} alignItems="flex-start">
            <Text fontSize="2xl" fontWeight={700}>
              Welcome to Materialize!
            </Text>
            <Text>To get started, please enable your first region:</Text>
          </VStack>
          <EnvironmentList />
        </Box>
      );
    } else {
      const currentEnvironment = environments.get(currentEnvironmentId)!;
      switch (currentEnvironment.state) {
        case "enabled":
          switch (currentEnvironment.health) {
            case "pending":
              break;
            case "booting":
              content = <StepsWhileLoading />;
              break;
            case "healthy":
              content = (
                <Card>
                  <CardHeader>Connect to Materialize</CardHeader>
                  <CardContent>
                    <VStack spacing={4} alignItems="stretch">
                      <PasswordStep />
                      <ConnectSteps />
                      <GetStartedDocs />
                    </VStack>
                  </CardContent>
                </Card>
              );
              break;
            case "crashed":
              content = <RegionCrashed environment={currentEnvironment} />;
              break;
          }
          break;
        case "disabled":
          content = (
            <Box textAlign="center">
              <VStack mb={8} spacing={6}>
                <Text fontSize="xl">
                  Region {currentEnvironmentId} is not enabled.
                </Text>
                <CreateEnvironmentButton
                  regionId={currentEnvironmentId}
                  size="lg"
                  variant="gradient-1"
                />
              </VStack>
            </Box>
          );
          break;
      }
    }
  }

  return (
    <>
      <PageHeader>
        <PageBreadcrumbs />
      </PageHeader>
      <VStack spacing={6} mb={6}>
        {content}
      </VStack>
    </>
  );
};

export default Home;
