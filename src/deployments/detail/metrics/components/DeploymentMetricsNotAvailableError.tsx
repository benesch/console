import { Alert } from "@chakra-ui/alert";
import { InfoIcon } from "@chakra-ui/icons";
import { Box, HStack, Text } from "@chakra-ui/layout";
import React from "react";

export const DeploymentMetricsNotAvailableError = () => {
  return (
    <Box p={4}>
      <Alert
        status="info"
        p={1}
        px={2}
        data-testid="deployment-metrics-not-available-info"
      >
        <HStack px={2}>
          <InfoIcon />
          <Text>
            The deployment utilization metrics are not available for this
            region.
          </Text>
        </HStack>
      </Alert>
    </Box>
  );
};
