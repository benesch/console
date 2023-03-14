import React from "react";
import { atom, useSetRecoilState } from "recoil";

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
