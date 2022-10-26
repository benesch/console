import { Alert, AlertIcon, Flex, Text, VStack } from "@chakra-ui/react";
import React from "react";

import SupportLink from "../../components/SupportLink";

const RegionCrashed = () => {
  return (
    <Flex flexDirection="column" alignItems="flex-start">
      <VStack spacing={2} alignItems="center">
        <Alert status="error" rounded="md" p={4} marginTop={2}>
          <AlertIcon />
          We&apos;re having trouble connecting to Materialize
        </Alert>
        <Text>Double check that your internet connection is healthy.</Text>
        <Text>
          <SupportLink>Contact support</SupportLink> if the issue persists.
        </Text>
      </VStack>
    </Flex>
  );
};

export default RegionCrashed;
