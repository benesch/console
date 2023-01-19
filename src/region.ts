import { useRecoilValue_TRANSITION_SUPPORT_UNSTABLE } from "recoil";

import config from "~/config";

import { currentEnvironmentIdState } from "./recoil/environments";

export const regionIdToSlug = (region: string) =>
  region.replace("/", "-").toLowerCase();

export const regionNameMap = new Map<string, string>();
for (const name of config.cloudRegions.keys()) {
  regionNameMap.set(regionIdToSlug(name), name);
}

export const useRegionSlug = () => {
  const currentEnvironmentId = useRecoilValue_TRANSITION_SUPPORT_UNSTABLE(
    currentEnvironmentIdState
  );
  return regionIdToSlug(currentEnvironmentId);
};
