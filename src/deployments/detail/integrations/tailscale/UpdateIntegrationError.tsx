import { Alert, AlertIcon } from "@chakra-ui/alert";
import { Text } from "@chakra-ui/layout";
import React from "react";

export const UpdateIntegrationError: React.FC<{ error: Error }> = ({
  error,
}) => {
  return (
    <Alert status="error" p={1} px={2} data-testid="update-integration-error">
      <AlertIcon />
      <Text>Error: {error.message}</Text>
    </Alert>
  );
};
