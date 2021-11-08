import { Alert, AlertIcon } from "@chakra-ui/alert";
import { Text } from "@chakra-ui/layout";
import React from "react";

export const DeploymentMetricsRetrieveError = () => {
  return (
    <Alert
      status="error"
      p={1}
      px={2}
      data-testid="fetch-deployment-metric-error"
    >
      <AlertIcon />
      <Text>Failed to load metrics for this deployment</Text>
    </Alert>
  );
};
