import {
  HStack,
  Spacer,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { useRecoilState } from "recoil";

import { Card } from "../../components/cardComponents";
import {
  PageBreadcrumbs,
  PageHeader,
  PageHeading,
} from "../../layouts/BaseLayout";
import { currentEnvironment } from "../../recoil/currentEnvironment";
import AdditionalSteps from "./AdditionalSteps";
import ConnectSteps from "./ConnectSteps";

const Home = () => {
  const [current, _] = useRecoilState(currentEnvironment);
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
            <PageHeading>Welcome to Materialize</PageHeading>
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
        <ConnectSteps />
        <Card>
          <AdditionalSteps />
        </Card>
      </VStack>
    </>
  );
};

export default Home;
