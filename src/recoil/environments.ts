import { atom } from "recoil";

import { SupportedCloudRegion } from "../api/backend";
import { Environment } from "../api/environment-controller";
import { EnvironmentAssignment } from "../api/region-controller";
import keys from "./keyConstants";

export type EnvironmentStatus =
  | "Loading"
  | "Starting"
  | "Enabled"
  | "Not enabled";

export type RegionEnvironment = EnvironmentAssignment &
  Environment &
  SupportedCloudRegion;

export const currentEnvironment = atom<RegionEnvironment | null>({
  key: keys.CURRENT_ENVIRONMENT,
  default: null,
});

export const environmentList = atom<RegionEnvironment[] | null>({
  key: keys.ENVIRONMENTS,
  default: null,
});

export const hasCreatedEnvironment = atom<boolean>({
  key: keys.HAS_CREATED_ENVIRONMENT,
  default: false,
});
