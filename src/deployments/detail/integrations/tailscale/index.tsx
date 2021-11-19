import { HStack, Link, Text, VStack } from "@chakra-ui/react";
import React from "react";

import { DisableTailscale } from "./DisableTailscale";
import { EnableEditTailscaleConfiguration } from "./EnableEditTailscaleConfiguration";
import { IntegrationStatus } from "./IntegrationStatus";

export const TailscaleIntegration = () => {
  return (
    <VStack w="full" alignItems="flex-start" px={4}>
      <Text>
        <Link
          href="https://tailscale.com"
          target="_blank"
          textDecoration="underline"
        >
          Tailscale
        </Link>{" "}
        is a VPN service that makes the devices and applications you own
        accessible anywhere in the world, securely and effortlessly.
        <br /> It enables encrypted point-to-point connections using the open
        source WireGuard protocol, which means only devices on your private
        network can communicate with each other, including your Materialize
        instance.
      </Text>
      <HStack w="full" justifyContent="space-between">
        <IntegrationStatus />
        <HStack>
          <DisableTailscale />
          <EnableEditTailscaleConfiguration />
        </HStack>
      </HStack>
    </VStack>
  );
};
