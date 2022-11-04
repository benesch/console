import { AddIcon } from "@chakra-ui/icons";
import {
  Button,
  ButtonProps,
  Spinner,
  useInterval,
  useToast,
} from "@chakra-ui/react";
import React from "react";
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from "recoil";

import { hasEnvironmentWritePermission, useAuth } from "../../api/auth";
import { EnvironmentAssignment } from "../../api/regionController";
import { createEnvironmentAssignment } from "../../api/regionController";
import config from "../../config";
import {
  currentEnvironmentIdState,
  environments,
  maybeEnvironment,
} from "../../recoil/environments";

interface Props extends ButtonProps {
  regionId: string;
  isCreatingEnv?: boolean;
  handleEnvCreate?: (flag: boolean) => void;
}

/*
 * Button that will create an environment given the region it's supposed to be making.
 * Optional boolean and callback in case something outside this needs to track if any
 * other envs are getting made.
 * Has some default button styling but you can override it with whatever.
 */
const CreateEnvironmentButton = (props: Props) => {
  const { user } = useAuth();
  const canWriteEnvironments = hasEnvironmentWritePermission(user);

  const [isCreatingThisEnv, setIsCreatingThisEnv] = React.useState(false);
  const setCurrentEnvironmentId = useSetRecoilState(currentEnvironmentIdState);
  const [newAssignment, setNewAssignment] = React.useState<
    EnvironmentAssignment | undefined
  >(undefined);

  const toast = useToast({ position: "top" });

  const { regionId, isCreatingEnv, handleEnvCreate, ...buttonProps } = props;
  const region = config.cloudRegions.get(regionId)!;

  const handleCreate = React.useCallback(async () => {
    try {
      setIsCreatingThisEnv(true);
      if (handleEnvCreate) handleEnvCreate(true);
      const response = await createEnvironmentAssignment(
        region.regionControllerUrl,
        {},
        user.accessToken
      );
      setNewAssignment(response.data);
    } catch (e: any) {
      console.log(e);
      setIsCreatingThisEnv(false);
      if (handleEnvCreate) handleEnvCreate(false);
      toast({
        title: "Failed to enable region.",
        status: "error",
      });
    }
  }, [region.regionControllerUrl]);

  const refreshNewEnvironment = useRecoilCallback(
    ({ refresh }) =>
      () => {
        if (newAssignment) {
          refresh(
            environments({
              assignment: newAssignment,
              accessToken: user.accessToken,
            })
          );
        }
      },
    [newAssignment]
  );
  const newEnvironments = useRecoilValue(
    maybeEnvironment({
      assignment: newAssignment,
      accessToken: user.accessToken,
    })
  );

  React.useEffect(() => {
    /*
     * Check for existence of envs before declaring success
     * TODO: check _status_ of env here rather than the current home page
     * when we no longer have the "we're setting up your region" intervening state.
     */
    if (isCreatingThisEnv && newEnvironments && newEnvironments.length > 0) {
      setIsCreatingThisEnv(false);
      if (handleEnvCreate) handleEnvCreate(false);
      setCurrentEnvironmentId(regionId);
      toast({
        title: "Region enabled.",
        status: "success",
      });
    }
  }, [isCreatingThisEnv, newEnvironments]);

  useInterval(() => {
    if (newAssignment && isCreatingThisEnv) {
      refreshNewEnvironment();
    }
  }, 3000);

  return (
    <Button
      leftIcon={isCreatingThisEnv ? <Spinner size="sm" /> : <AddIcon />}
      colorScheme="purple"
      size="sm"
      float="right"
      onClick={handleCreate}
      disabled={!canWriteEnvironments || isCreatingThisEnv || isCreatingEnv}
      title={
        canWriteEnvironments
          ? `Enable ${regionId}`
          : "Only admins can enable new regions."
      }
      {...buttonProps}
    >
      {isCreatingThisEnv ? "Enabling region..." : "Enable region"}
    </Button>
  );
};

export default CreateEnvironmentButton;
