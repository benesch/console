import { HStack, Text, VStack } from "@chakra-ui/react";
import React from "react";

import TextLink from "../../../../components/TextLink";
import {
  DeploymentIntegrationCallToActionProps,
  DeploymentIntegrationTabProps,
} from "../types";
import DisableTailscale from "./DisableTailscale";
import EnableEditTailscaleConfiguration from "./EnableEditTailscaleConfiguration";
import IntegrationStatus from "./IntegrationStatus";

const TailscaleIntegration: React.FC<DeploymentIntegrationTabProps> = ({
  deployment,
  refetch,
}) => {
  const callToActionsProps: DeploymentIntegrationCallToActionProps = {
    id: deployment.id,
    enabled: deployment.enableTailscale ?? false,
    refetch,
  };
  return (
    <VStack w="full" alignItems="flex-start">
      <Text>
        <TextLink href="https://tailscale.com" target="_blank">
          Tailscale
        </TextLink>{" "}
        is a VPN service that enables encrypted point-to-point connections using
        the open source{" "}
        <TextLink href="https://wireguard.com" target="_blank">
          WireGuard
        </TextLink>{" "}
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

export default TailscaleIntegration;
