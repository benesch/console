import React from "react";
import {
  atom,
  useRecoilValue_TRANSITION_SUPPORT_UNSTABLE,
  useSetRecoilState,
} from "recoil";

import { isPollingDisabled } from "~/util";

export const useTrackFocus = () => {
  const setValue = useSetRecoilState(isFocusedState);

  const handleBlur = React.useCallback(() => {
    setValue(false);
  }, [setValue]);
  const handleFocus = React.useCallback(() => {
    setValue(true);
  }, [setValue]);

  React.useEffect(() => {
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
  });
};

export const isFocusedState = atom<boolean>({
  key: "isFocused",
  default: document.hasFocus(),
});

/**
 * Checks if polling should be disabled because of the noPoll query param or because the document is not currently focused
 */
export const useIsPollingDisabled = () => {
  const isFocused = useRecoilValue_TRANSITION_SUPPORT_UNSTABLE(isFocusedState);
  return isPollingDisabled() || !isFocused;
};
