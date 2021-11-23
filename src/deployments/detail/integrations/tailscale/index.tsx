import { HStack, Link, Text, VStack } from "@chakra-ui/react";
import React from "react";

import {
  DeploymentIntegrationCallToActionProps,
  DeploymentIntegrationTabProps,
} from "../types";
import { DisableTailscale } from "./DisableTailscale";
import { EnableEditTailscaleConfiguration } from "./EnableEditTailscaleConfiguration";
import { IntegrationStatus } from "./IntegrationStatus";

export const TailscaleIntegration: React.FC<DeploymentIntegrationTabProps> = ({
  deployment,
  refetch,
}) => {
  const callToActionsProps: DeploymentIntegrationCallToActionProps = {
    id: deployment.id,
    enabled: deployment.enableTailscale ?? false,
    refetch,
  };
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
        is a VPN service that enables encrypted point-to-point connections using
        the open source{" "}
        <Link
          href="https://wireguard.com"
          target="_blank"
          textDecoration="underline"
        >
          WireGuard
        </Link>{" "}
        protocol. This means only devices on your private network can
        communicate with each other.
      </Text>
      <HStack w="full" justifyContent="space-between">
        <IntegrationStatus enabled={callToActionsProps.enabled} />
        <HStack>
          <DisableTailscale {...callToActionsProps} />
          <EnableEditTailscaleConfiguration {...callToActionsProps} />
        </HStack>
      </HStack>
    </VStack>
  );
};
