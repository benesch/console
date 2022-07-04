import { atom, selector } from "recoil";

import {
  currentEnvironment,
  environmentList,
  hasCreatedEnvironment,
} from "./environments";
import keys from "./keyConstants";

/*
  tracks whether the user has manually closed the first region modal
  so we can respect that
*/
export const hasClosedFirstRegionModalManually = atom<boolean>({
  default: false,
  key: keys.HAS_CLOSED_FIRST_REGION_MODAL_MANUALLY,
});

/*
  track whether
  - the user has ever, in this load at least, created an env
  - after envs have loaded
  - or the user has closed the modal themselves
  and show or not show the welcome modal accordingly
*/
export const showFirstRegionModal = selector<boolean>({
  key: keys.SHOW_CREATE_REGION_MODAL,
  get: ({ get }) => {
    const current = get(currentEnvironment);
    const envList = get(environmentList);
    const hasCreated = get(hasCreatedEnvironment);
    const hasClosed = get(hasClosedFirstRegionModalManually);
    return !current && !hasCreated && !hasClosed && envList !== null;
  },
});
