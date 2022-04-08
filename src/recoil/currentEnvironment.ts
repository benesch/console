import { atom } from "recoil";

import keys from "./keyConstants";

export interface RegionEnvironment {
  provider: string;
  region: string;
  address: string;
}

export const currentEnvironment = atom<RegionEnvironment | null>({
  key: keys.CURRENT_ENVIRONMENT,
  default: null,
});
