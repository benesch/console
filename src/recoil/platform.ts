import { atom } from "recoil";

import keys from "./keyConstants";

const platform = atom({
  key: keys.PLATFORM,
  default: window.CONFIG.isDevelopment,
});

export default platform;
