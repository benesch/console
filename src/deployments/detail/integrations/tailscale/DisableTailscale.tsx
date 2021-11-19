import React from "react";

import { ConfirmActionButton } from "../../../../components/confirmActionButton";
import { useDeployment } from "../../DeploymentProvider";
import { useDisableIntegration } from "./hooks";

export const DisableTailscale = () => {
  const { deployment } = useDeployment();
  const { disableIntegration } = useDisableIntegration();

  if (!deployment?.enableTailscale) return null;
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
