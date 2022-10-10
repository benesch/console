import { AddIcon } from "@chakra-ui/icons";
import {
  Button,
  ButtonProps,
  Spinner,
  useInterval,
  useToast,
} from "@chakra-ui/react";
import React from "react";
import { useRecoilState } from "recoil";

import { hasEnvironmentWritePermission, useAuth } from "../../api/auth";
import { SupportedCloudRegion } from "../../api/backend";
import { EnvironmentAssignment } from "../../api/region-controller";
import { fetchEnvironments } from "../../api/useAvailableEnvironments";
import {
  currentEnvironment,
  hasCreatedEnvironment,
} from "../../recoil/environments";

interface Props extends ButtonProps {
  region: SupportedCloudRegion;
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
  // tutorial flag that the user has ever made an env: TODO this is not currently used
  const [_, setHasCreatedEnv] = useRecoilState(hasCreatedEnvironment);
  const [_current, setCurrent] = useRecoilState(currentEnvironment);
  const [newAssignment, setNewAssignment] =
    React.useState<EnvironmentAssignment | null>(null);

  const toast = useToast();

  const { region: r, isCreatingEnv, handleEnvCreate, ...buttonProps } = props;

  const handleCreate = React.useCallback(async () => {
    try {
      setIsCreatingThisEnv(true);
      if (handleEnvCreate) handleEnvCreate(true);
      const response = await fetchAuthed(
        `${r.regionControllerUrl}/api/environmentassignment`,
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
  }, [r.regionControllerUrl]);

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
        setHasCreatedEnv(true);
        setCurrent({ region: props.region });
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
          ? `Enable ${r.provider}/${r.region}`
          : "Only admins can enable new regions."
      }
      {...buttonProps}
    >
      {isCreatingThisEnv ? "Enabling region..." : "Enable region"}
    </Button>
  );
};

export default CreateEnvironmentButton;
