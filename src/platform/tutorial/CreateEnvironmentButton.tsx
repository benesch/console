import { AddIcon } from "@chakra-ui/icons";
import { Button, ButtonProps, Spinner } from "@chakra-ui/react";
import React from "react";

import { hasEnvironmentWritePermission, useAuth } from "~/api/auth";
import { CreateRegion } from "~/platform/tutorial/useCreateEnvironment";

interface Props extends ButtonProps {
  regionId: string;
  createRegion: CreateRegion;
  creatingRegionId?: string;
}

/*
 * Button that creates an environment for given region.
 * Creation is handled by the useCreateEnvironment hook,
 * createRegion and creatingRegionId should be passed down from there.
 * Has some default button styling but you can override it with whatever.
 */
const CreateEnvironmentButton = (props: Props) => {
  const { user } = useAuth();
  const canWriteEnvironments = hasEnvironmentWritePermission(user);
  const { regionId, creatingRegionId, createRegion, ...buttonProps } = props;

  const creatingThisRegion = creatingRegionId === regionId;
  return (
    <Button
      leftIcon={creatingThisRegion ? <Spinner size="sm" /> : <AddIcon />}
      colorScheme="purple"
      size="sm"
      float="right"
      onClick={() => createRegion(regionId)}
      isDisabled={!canWriteEnvironments || !!creatingThisRegion}
      title={
        canWriteEnvironments
          ? `Enable ${regionId}`
          : "Only admins can enable new regions."
      }
      {...buttonProps}
    >
      {creatingThisRegion ? "Enabling region..." : "Enable region"}
    </Button>
  );
};

export default CreateEnvironmentButton;
