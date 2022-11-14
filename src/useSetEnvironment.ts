import React from "react";
import { useSetRecoilState } from "recoil";

import {
  currentEnvironmentIdState,
  SELECTED_REGION_KEY,
} from "./recoil/environments";
import storageAvailable from "./utils/storageAvailable";

const useSetEnvironment = () => {
  const setCurrentEnvironment = useSetRecoilState(currentEnvironmentIdState);
  React.useEffect(() => {
    if (storageAvailable("localStorage")) {
      const lastRegion = window.localStorage.getItem(SELECTED_REGION_KEY);
      if (!lastRegion) return;
      setCurrentEnvironment(lastRegion);
    }
  }, [setCurrentEnvironment]);
};

export default useSetEnvironment;
