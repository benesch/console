import React from "react";

import ConfirmActionPopover from "../../../../components/ConfirmActionPopover";
import { DeploymentIntegrationCallToActionProps } from "../types";
import { useDisableIntegration } from "./hooks";

const DisableTailscale: React.FC<DeploymentIntegrationCallToActionProps> = (
  props
) => {
  const { disableIntegration, operation } = useDisableIntegration(props);

  if (!props.enabled) return null;
  return (
    <ConfirmActionPopover
      colorScheme="red"
      variant="outline"
      size="sm"
      confirmationText="Are you sure to want to disable the Tailscale integration for this deployment ?"
      onConfirm={disableIntegration}
      disabled={operation.loading}
    >
      Disable
    </ConfirmActionPopover>
  );
};

export default DisableTailscale;
