import {
  Alert,
  AlertIcon,
  Flex,
  FlexProps,
  Text,
  VStack,
} from "@chakra-ui/react";
import React from "react";

import SupportLink from "./SupportLink";

export interface ErrorBoxProps extends FlexProps {
  message?: string;
}

/** Displays a simple error message that takes up it's full container */
const ErrorBox = ({ message, ...flexProps }: ErrorBoxProps) => {
  return (
    <Flex
      h="100%"
      w="100%"
      alignItems="center"
      justifyContent="center"
      {...flexProps}
    >
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

export default ErrorBox;
