import React from "react";
import { useSetRecoilState } from "recoil";

import { currentEnvironmentIdState } from "./recoil/environments";
import storageAvailable from "./utils/storageAvailable";

const SELECTED_REGION_KEY = "mz-selected-region";

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
