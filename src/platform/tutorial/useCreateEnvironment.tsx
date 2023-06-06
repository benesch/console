import { useToast } from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue_TRANSITION_SUPPORT_UNSTABLE } from "recoil";

import { createEnvironmentAssignment } from "~/api/regionController";
import config from "~/config";
import { maybeEnvironmentForRegion } from "~/recoil/environments";
import { regionIdToSlug } from "~/region";

export type CreateRegion = (regionId: string) => Promise<void>;

// Relies on the environment health polling in EnvironmentSelector
const useCreateEnvironment = (accessToken: string) => {
  const [creatingRegionId, setCreatingRegionId] = React.useState<string>();
  const navigate = useNavigate();
  const toast = useToast({ position: "top" });

  const createRegion = React.useCallback(
    async (regionId: string) => {
      const region = config.cloudRegions.get(regionId)!;
      try {
        setCreatingRegionId(regionId);
        await createEnvironmentAssignment(
          region.regionControllerUrl,
          {},
          accessToken
        );
        navigate(`/regions/${regionIdToSlug(regionId)}/connect`);
      } catch (e: any) {
        console.log(e);
        setCreatingRegionId(undefined);
        toast({
          title: "Failed to enable region.",
          status: "error",
        });
      }
    },
    [accessToken, navigate, toast]
  );

  const newEnvironment = useRecoilValue_TRANSITION_SUPPORT_UNSTABLE(
    maybeEnvironmentForRegion({
      regionId: creatingRegionId,
    })
  );

  React.useEffect(() => {
    /*
     * Check for existence of envs before declaring success
     * TODO: check _status_ of env here rather than the current home page
     * when we no longer have the "we're setting up your region" intervening state.
     */
    if (
      creatingRegionId &&
      newEnvironment &&
      newEnvironment.state !== "disabled"
    ) {
      setCreatingRegionId(undefined);
      toast({
        title: "Region enabled.",
        status: "success",
      });
    }
  }, [creatingRegionId, navigate, newEnvironment, toast]);

  return {
    creatingRegionId,
    createRegion,
  };
};

export default useCreateEnvironment;
