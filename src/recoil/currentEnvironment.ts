import { atom } from "recoil";

import keys from "./keyConstants";

const currentEnvironment = atom({
  key: keys.CURRENT_ENVIRONMENT,
  // TODO remove All once we can no longer view across environments
  default: "All", // "AWS us-east-1",
});

export default currentEnvironment;
