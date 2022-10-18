import { atom, selectorFamily } from "recoil";

import { SupportedCloudRegion } from "../api/backend";
import { Environment } from "../api/environment-controller";
import { EnvironmentAssignment } from "../api/region-controller";
import keys from "./keyConstants";

// Currently the identifier for unique envs is their provider + their region
export const getRegionId = (region?: SupportedCloudRegion): string => {
  if (region) {
    return `${region.provider}/${region.region}`;
  }
  return "";
};

export type EnvironmentStatus =
  | "Loading"
  | "Starting"
  | "Enabled"
  | "Crashed"
  | "Not enabled";

export type RegionEnvironment = {
  region: SupportedCloudRegion;
  assignment?: EnvironmentAssignment;
  env?: Environment;
};

export type ActiveRegionEnvironment = RegionEnvironment & {
  assignment: EnvironmentAssignment;
  env: Environment;
};

export const currentEnvironment = atom<RegionEnvironment | null>({
  key: keys.CURRENT_ENVIRONMENT,
  default: null,
});

export const environmentList = atom<RegionEnvironment[] | null>({
  key: keys.ENVIRONMENTS,
  default: null,
});

export const activeEnvironmentList = atom<ActiveRegionEnvironment[] | null>({
  key: keys.ACTIVE_ENVIRONMENTS,
  default: null,
});

export const hasCreatedEnvironment = atom<boolean>({
  key: keys.HAS_CREATED_ENVIRONMENT,
  default: false,
});

export const firstEnvLoad = atom<boolean>({
  key: keys.ON_FIRST_LOAD,
  default: true,
});

export type StatusMap = {
  [key: string]: EnvironmentStatus;
};

/*
 * Map environment IDs (per the `getRegionId` helper) to their statuses
 */
export const environmentStatusMap = atom<StatusMap>({
  key: keys.ENVIRONMENT_STATUS_MAP,
  default: {},
});

export const singleEnvironmentStatus = selectorFamily<
  EnvironmentStatus,
  string
>({
  key: keys.ENVIRONMENT_STATUS,
  get:
    (id: string) =>
    ({ get }) => {
      return get(environmentStatusMap)[id];
    },
});
