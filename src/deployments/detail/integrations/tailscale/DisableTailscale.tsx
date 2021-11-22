import React from "react";

import { ConfirmActionButton } from "../../../../components/confirmActionButton";
import { DeploymentIntegrationCallToActionProps } from "../types";
import { useDisableIntegration } from "./hooks";

export const DisableTailscale: React.FC<DeploymentIntegrationCallToActionProps> =
  (props) => {
    const { disableIntegration } = useDisableIntegration(props);

    if (!props.enabled) return null;
    return (
      <ConfirmActionButton
        colorScheme="red"
        variant="outline"
        size="sm"
        confirmationText="Are you sure to want to disable the Tailscale integration for this deployment ?"
        onConfirm={disableIntegration}
      >
        Disable
      </ConfirmActionButton>
    );
  };
