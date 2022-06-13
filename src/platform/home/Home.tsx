import {
  Box,
  HStack,
  Spacer,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { useRecoilState } from "recoil";

import { Card, CardContent, CardHeader } from "../../components/cardComponents";
import {
  PageBreadcrumbs,
  PageHeader,
  PageHeading,
} from "../../layouts/BaseLayout";
import EnvironmentSelectField from "../../layouts/EnvironmentSelect";
import { currentEnvironment } from "../../recoil/currentEnvironment";
import AdditionalSteps from "./AdditionalSteps";
import ConnectSteps from "./ConnectSteps";
import StepsWhileLoading from "./StepsWhileLoading";
import useEnvironmentState from "./useEnvironmentState";

const Home = () => {
  const [current, _] = useRecoilState(currentEnvironment);
  const { state: environmentState } = useEnvironmentState(
    current?.environmentControllerUrl
  );
  const grayText = useColorModeValue("gray.600", "gray.200");

  return (
    <>
      <PageBreadcrumbs />
      <PageHeader>
        <HStack
          spacing={4}
          alignItems="center"
          justifyContent="flex-start"
          width="100%"
        >
          <VStack alignItems="flex-start">
            <PageHeading>Welcome to Materialize!</PageHeading>
            <Text fontSize="md" textColor={grayText}>
              Region:{" "}
              {current
                ? `${current?.provider}/${current?.region}`
                : "No region active"}
            </Text>
          </VStack>
          <Spacer />
        </HStack>
      </PageHeader>
      <VStack spacing={6} mb={6}>
        {environmentState === "Enabled" && (
          <>
            <Card>
              <CardHeader>Connect</CardHeader>
              <CardContent>
                <ConnectSteps />
              </CardContent>
            </Card>
            <Card>
              <AdditionalSteps />
            </Card>
          </>
        )}
        {(environmentState === "Loading" ||
          environmentState === "Starting") && <StepsWhileLoading />}
        {environmentState === "Not enabled" && (
          <Box textAlign="center">
            <EnvironmentSelectField size="lg" margin="auto" />
          </Box>
        )}
      </VStack>
    </>
  );
};

export default Home;
