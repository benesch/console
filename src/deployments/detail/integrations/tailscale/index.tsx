import { Button, Collapse, HStack, Text, VStack } from "@chakra-ui/react";
import React from "react";

import { DisableIntegration } from "./DisableIntegrationButton";
import { EnableEditTailscaleConfiguration } from "./EnableEditTailscaleConfiguration";
import { IntegrationStatus } from "./IntegrationStatus";

export const TailscaleIntegration = () => {
  return (
    <VStack w="full" alignItems="flex-start" px={4}>
      <Text>
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem
        accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab
        illo inventore veritatis et quasi architecto beatae vitae dicta sunt
        explicabo.
      </Text>
      <HStack w="full" justifyContent="space-between">
        <IntegrationStatus />
        <HStack>
          <DisableIntegration />
          <EnableEditTailscaleConfiguration />
        </HStack>
      </HStack>
    </VStack>
  );
};
