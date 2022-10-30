import { AddIcon } from "@chakra-ui/icons";
import {
  Button,
  ButtonProps,
  Spinner,
  useInterval,
  useToast,
} from "@chakra-ui/react";
import React from "react";
import { useRecoilState, useSetRecoilState } from "recoil";

import { hasEnvironmentWritePermission, useAuth } from "../../api/auth";
import { EnvironmentAssignment } from "../../api/region-controller";
import { fetchEnvironments } from "../../api/useAvailableEnvironments";
import config from "../../config";
import { currentEnvironmentIdState } from "../../recoil/environments";
import { CloudRegion } from "../../types";

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
  const { user, fetchAuthed } = useAuth();
  const canWriteEnvironments = hasEnvironmentWritePermission(user);

  const [isCreatingThisEnv, setIsCreatingThisEnv] = React.useState(false);
  const setCurrentEnvironmentId = useSetRecoilState(currentEnvironmentIdState);
  const [newAssignment, setNewAssignment] =
    React.useState<EnvironmentAssignment | null>(null);

  const toast = useToast();

  const { regionId, isCreatingEnv, handleEnvCreate, ...buttonProps } = props;
  const region = config.cloudRegions.get(regionId)!;

  const handleCreate = React.useCallback(async () => {
    try {
      setIsCreatingThisEnv(true);
      if (handleEnvCreate) handleEnvCreate(true);
      const response = await fetchAuthed(
        `${region.regionControllerUrl}/api/environmentassignment`,
        {
          body: JSON.stringify({}),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        }
      );
      setNewAssignment(JSON.parse(await response.text()));
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

  const checkForEnv = React.useCallback(async () => {
    if (newAssignment) {
      const { environments, errorMessage } = await fetchEnvironments(
        newAssignment,
        fetchAuthed
      );
      /*
       * Check for existence of envs before declaring success
       * TODO: check _status_ of env here rather than the current home page
       * when we no longer have the "we're setting up your region" intervening state.
       */
      if (environments.length > 0) {
        setIsCreatingThisEnv(false);
        if (handleEnvCreate) handleEnvCreate(false);
        setCurrentEnvironmentId(regionId);
        toast({
          title: "Region enabled.",
          status: "success",
        });
      } else if (errorMessage) {
        setIsCreatingThisEnv(false);
        if (handleEnvCreate) handleEnvCreate(false);
        toast({
          title: "Failed to enable region.",
          status: "error",
        });
      }
    }
  }, [newAssignment]);

  useInterval(() => {
    if (newAssignment && isCreatingThisEnv) {
      checkForEnv();
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
