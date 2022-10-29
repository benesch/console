import { Box, HStack, Spinner, Text, VStack } from "@chakra-ui/react";
import React from "react";
import { useRecoilState } from "recoil";

import { Card, CardContent, CardHeader } from "../../components/cardComponents";
import { PageBreadcrumbs, PageHeader } from "../../layouts/BaseLayout";
import {
  currentEnvironment,
  environmentStatusMap,
  firstEnvLoad,
  getRegionId,
} from "../../recoil/environments";
import CreateEnvironmentButton from "../tutorial/CreateEnvironmentButton";
import EnvironmentList from "../tutorial/EnvironmentList";
import ConnectSteps from "./ConnectSteps";
import GetStartedDocs from "./GetStartedDocs";
import PasswordStep from "./PasswordStep";
import RegionCrashed from "./RegionCrashed";
import StepsWhileLoading from "./StepsWhileLoading";

const Home = () => {
  const [current, _] = useRecoilState(currentEnvironment);
  const [statusMap] = useRecoilState(environmentStatusMap);
  const idString = current ? getRegionId(current?.region) : "";
  const environmentStatus = idString ? statusMap[idString] : "Not enabled";
  const [isLoadingFirstData] = useRecoilState(firstEnvLoad);

  let content = (
    <HStack justifyContent="flex-start" width="100%">
      <Spinner />
    </HStack>
  );

  if (!isLoadingFirstData) {
    if (current) {
      switch (environmentStatus) {
        case "Enabled":
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
        case "Not enabled":
          content = (
            <Box textAlign="center">
              <VStack mb={8} spacing={6}>
                <Text fontSize="xl">
                  Region {current.region.provider}/{current.region.region} is
                  not enabled.
                </Text>
                <CreateEnvironmentButton
                  region={current.region}
                  size="lg"
                  variant="gradient-1"
                />
              </VStack>
            </Box>
          );
          break;
        case "Starting":
          content = <StepsWhileLoading />;
          break;
        case "Crashed":
          content = <RegionCrashed />;
          break;
        default:
          break;
      }
    } else {
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
