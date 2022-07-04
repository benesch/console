import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import {
  hasClosedFirstRegionModalManually,
  showFirstRegionModal,
} from "../../recoil/tutorial";
import EnvironmentListModal from "../environments/EnvironmentsListModal";

/* When the home page loads, pop up a modal to make an environment
   if the user doesn't already have one. */

const StarterEnvironmentModal = (): JSX.Element => {
  const [_, setManualClose] = useRecoilState(hasClosedFirstRegionModalManually);
  const isOpen = useRecoilValue(showFirstRegionModal);

  return (
    <EnvironmentListModal
      isOpen={isOpen}
      onClose={() => setManualClose(true)}
      isWelcome
    />
  );
};

export default StarterEnvironmentModal;
