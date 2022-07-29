import { Box, Spinner, Text, VStack } from "@chakra-ui/react";
import React from "react";
import { useRecoilState } from "recoil";

import { useCloudProvidersList } from "../../api/backend";
import useEnvironmentState from "../../api/useEnvironmentState";
import { Card, CardContent, CardHeader } from "../../components/cardComponents";
import { PageBreadcrumbs } from "../../layouts/BaseLayout";
import { currentEnvironment } from "../../recoil/environments";
import CreateEnvironmentButton from "../tutorial/CreateEnvironmentButton";
import EnvironmentList from "../tutorial/EnvironmentList";
import ConnectSteps from "./ConnectSteps";
import GetStartedDocs from "./GetStartedDocs";
import PasswordStep from "./PasswordStep";
import StepsWhileLoading from "./StepsWhileLoading";

const Home = () => {
  const [current, _] = useRecoilState(currentEnvironment);
  const { status: environmentStatus } = useEnvironmentState(
    current?.assignment?.environmentControllerUrl
  );
  const { data: regions } = useCloudProvidersList({});

  let content = <Spinner />;

  if (regions) {
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
        case "Loading":
          content = <StepsWhileLoading />;
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
          <EnvironmentList regions={regions} />
        </Box>
      );
    }
  }

  return (
    <>
      <PageBreadcrumbs />
      <VStack spacing={6} mb={6}>
        {content}
      </VStack>
    </>
  );
};

export default Home;
