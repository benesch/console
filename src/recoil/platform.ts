import { atom } from "recoil";

import keys from "./keyConstants";

const platform = atom({
  key: keys.PLATFORM,
  default: true, // edit to see platform-specific features
});

export default platform;
