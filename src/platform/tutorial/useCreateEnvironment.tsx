import { useToast } from "@chakra-ui/toast";
import React from "react";
import {
  useRecoilState_TRANSITION_SUPPORT_UNSTABLE,
  useRecoilValue_TRANSITION_SUPPORT_UNSTABLE,
} from "recoil";

import {
  createEnvironmentAssignment,
  EnvironmentAssignment,
} from "../../api/regionController";
import config from "../../config";
import {
  currentEnvironmentIdState,
  maybeEnvironmentsForRegion,
} from "../../recoil/environments";

export type CreateRegion = (regionId: string) => Promise<void>;

// Relies on the environment health polling in EnvironmentSelector
const useCreateEnvironment = (accessToken: string) => {
  const [creatingRegionId, setCreatingRegionId] = React.useState<string>();
  const [newAssignment, setNewAssignment] = React.useState<
    EnvironmentAssignment | undefined
  >(undefined);
  const [, setCurrentEnvironmentId] =
    useRecoilState_TRANSITION_SUPPORT_UNSTABLE(currentEnvironmentIdState);

  const toast = useToast({ position: "top" });

  const createRegion = React.useCallback(async (regionId: string) => {
    const region = config.cloudRegions.get(regionId)!;
    try {
      setCreatingRegionId(regionId);
      const response = await createEnvironmentAssignment(
        region.regionControllerUrl,
        {},
        accessToken
      );
      setNewAssignment(response.data);
    } catch (e: any) {
      console.log(e);
      setCreatingRegionId(undefined);
      toast({
        title: "Failed to enable region.",
        status: "error",
      });
    }
  }, []);

  const newEnvironments = useRecoilValue_TRANSITION_SUPPORT_UNSTABLE(
    maybeEnvironmentsForRegion({
      environmentControllerUrl: newAssignment?.environmentControllerUrl,
      accessToken: accessToken,
    })
  );

  React.useEffect(() => {
    /*
     * Check for existence of envs before declaring success
     * TODO: check _status_ of env here rather than the current home page
     * when we no longer have the "we're setting up your region" intervening state.
     */
    if (creatingRegionId && newEnvironments && newEnvironments.length > 0) {
      setCreatingRegionId(undefined);
      setNewAssignment(undefined);
      setCurrentEnvironmentId(creatingRegionId);
      toast({
        title: "Region enabled.",
        status: "success",
      });
    }
  }, [creatingRegionId, newEnvironments]);

  return {
    creatingRegionId,
    createRegion,
  };
};

export default useCreateEnvironment;
