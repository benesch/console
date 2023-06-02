import { AddIcon } from "@chakra-ui/icons";
import { Button, ButtonProps, Spinner } from "@chakra-ui/react";
import { useFlags } from "launchdarkly-react-client-sdk";
import React from "react";
import { useRecoilValue_TRANSITION_SUPPORT_UNSTABLE } from "recoil";

import { hasEnvironmentWritePermission, useAuth } from "~/api/auth";
import { CreateRegion } from "~/platform/tutorial/useCreateEnvironment";
import { numEnabledEnvironmentsState } from "~/recoil/environments";

interface Props extends ButtonProps {
  regionId: string;
  createRegion: CreateRegion;
  creatingRegionId?: string;
  tenantIsBlocked?: boolean;
}

/*
 * Button that creates an environment for given region.
 * Creation is handled by the useCreateEnvironment hook,
 * createRegion and creatingRegionId should be passed down from there.
 * Has some default button styling but you can override it with whatever.
 */
const CreateEnvironmentButton = (props: Props) => {
  const { user } = useAuth();
  const flags = useFlags();
  const canWriteEnvironments = hasEnvironmentWritePermission(user);
  const numEnabledEnvironments = useRecoilValue_TRANSITION_SUPPORT_UNSTABLE(
    numEnabledEnvironmentsState
  );
  const {
    regionId,
    creatingRegionId,
    createRegion,
    tenantIsBlocked,
    ...buttonProps
  } = props;

  const creatingThisRegion = creatingRegionId === regionId;
  const exceededMaxEnvironments =
    numEnabledEnvironments !== undefined &&
    numEnabledEnvironments >= flags["max-environments"];
  return (
    <Button
      leftIcon={creatingThisRegion ? <Spinner size="sm" /> : <AddIcon />}
      colorScheme="purple"
      size="sm"
      float="right"
      onClick={() => createRegion(regionId)}
      isDisabled={
        !canWriteEnvironments ||
        !!creatingThisRegion ||
        !!tenantIsBlocked ||
        exceededMaxEnvironments
      }
      title={
        !canWriteEnvironments
          ? "Only admins can enable new regions."
          : exceededMaxEnvironments
          ? "You have already enabled the maximum allowed number of regions for your account. Contact support to raise your limit."
          : `Enable ${regionId}`
      }
      {...buttonProps}
    >
      {creatingThisRegion ? "Enabling region..." : "Enable region"}
    </Button>
  );
};

export default CreateEnvironmentButton;
