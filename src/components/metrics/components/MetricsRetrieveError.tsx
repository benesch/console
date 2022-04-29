import { Alert, AlertIcon } from "@chakra-ui/alert";
import { Text } from "@chakra-ui/layout";
import React from "react";

type Props = {
  errorMessage: string;
  testId: string;
};

const DeploymentMetricsRetrieveError = ({ errorMessage, testId }: Props) => {
  return (
    <Alert status="error" p={1} px={2} data-testid={testId}>
      <AlertIcon />
      <Text>{errorMessage}</Text>
    </Alert>
  );
};

export default DeploymentMetricsRetrieveError;
