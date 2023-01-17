import { Box, Heading, HStack, Spinner, Text, VStack } from "@chakra-ui/react";
import { ApiError } from "openapi-typescript-fetch";
import React from "react";
import { useRecoilValue_TRANSITION_SUPPORT_UNSTABLE } from "recoil";

import { useAuth } from "~/api/auth";
import ConnectSteps from "~/platform/home/ConnectSteps";
import GetStartedDocs from "~/platform/home/GetStartedDocs";
import PasswordStep from "~/platform/home/PasswordStep";
import RegionCrashed from "~/platform/home/RegionCrashed";
import StepsWhileLoading from "~/platform/home/StepsWhileLoading";
import CreateEnvironmentButton from "~/platform/tutorial/CreateEnvironmentButton";
import EnvironmentList from "~/platform/tutorial/EnvironmentList";
import useCreateEnvironment from "~/platform/tutorial/useCreateEnvironment";
import {
  currentEnvironmentIdState,
  useEnvironmentsWithHealth,
} from "~/recoil/environments";
import { isPollingDisabled } from "~/util";

const Home = () => {
  const { user } = useAuth();
  const environments = useEnvironmentsWithHealth(user.accessToken, {
    intervalMs: isPollingDisabled() ? undefined : 5000,
  });
  const { creatingRegionId, createRegion } = useCreateEnvironment(
    user.accessToken
  );
  const currentEnvironmentId = useRecoilValue_TRANSITION_SUPPORT_UNSTABLE(
    currentEnvironmentIdState
  );

  let content = (
    <HStack justifyContent="flex-start" width="100%">
      <Spinner />
    </HStack>
  );

  if (Array.from(environments.values()).every((e) => e.state === "disabled")) {
    content = (
      <Box textAlign="center">
        <VStack mb={4} spacing={2} alignItems="flex-start">
          <Text fontSize="2xl" fontWeight={700}>
            Welcome to Materialize!
          </Text>
          <Text>To get started, please enable your first region:</Text>
        </VStack>
        <EnvironmentList
          createRegion={createRegion}
          creatingRegionId={creatingRegionId}
        />
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
              <VStack
                alignItems="center"
                justifyContent="center"
                flex={1}
                spacing={6}
                h="full"
                maxWidth="2xl"
              >
                <Heading fontSize="2xl" fontWeight="500" textAlign="center">
                  Connect to Materialize
                </Heading>
                <VStack spacing={6} alignItems="stretch" fontSize="sm" w="2xl">
                  <ConnectSteps />
                  <PasswordStep />
                  <GetStartedDocs />
                </VStack>
              </VStack>
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
                createRegion={createRegion}
                creatingRegionId={creatingRegionId}
                size="lg"
                variant="gradient-1"
              />
            </VStack>
          </Box>
        );
        break;
    }
  }

  return (
    <VStack flex={1} h="full" w="full">
      <VStack
        spacing={6}
        mb={6}
        h="full"
        w="full"
        alignItems="center"
        justifyContent="center"
      >
        <React.Suspense
          fallback={
            <HStack justifyContent="flex-start" width="100%">
              <Spinner />
            </HStack>
          }
        >
          {content}
        </React.Suspense>
      </VStack>
    </VStack>
  );
};

export default Home;
