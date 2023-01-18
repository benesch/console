import { Alert, AlertIcon, Flex, Text, VStack } from "@chakra-ui/react";
import React from "react";

import SupportLink from "./SupportLink";

const FullPageError = ({ message }: { message?: string }) => {
  return (
    <Flex h="100%" w="100%" alignItems="center" justifyContent="center">
      <VStack spacing={2}>
        <Alert status="error" rounded="md" p={4} marginTop={2}>
          <AlertIcon />
          {message ?? "An unexpected error has occured"}
        </Alert>
        <Text>
          Visit our <SupportLink>help center</SupportLink> if the issue
          persists.
        </Text>
      </VStack>
    </Flex>
  );
};

export const GenericError = () => {
  return <FullPageError />;
};

export default FullPageError;
