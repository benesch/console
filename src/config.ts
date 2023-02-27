/* Globals injected by Webpack's DefinePlugin.*/

import { buildCloudRegions, getRegionId } from "~/cloudRegions";

import storageAvailable from "./utils/storageAvailable";

const getCurrentStack = () => {
  let stack = __DEFAULT_STACK__;
  if (storageAvailable("localStorage")) {
    stack = window.localStorage.getItem("mz-current-stack") || stack;
  }
  return stack;
};

const getFronteggUrl = (stack: string) => {
  if (stack === "production") {
    return `https://admin.cloud.materialize.com`;
  }
  if (stack === "local") {
    return `https://admin.staging.cloud.materialize.com`;
  }
  return `https://admin.${currentStack}.cloud.materialize.com`;
};

const currentStack = getCurrentStack();
const cloudRegions = new Map(
  buildCloudRegions(currentStack).map((r) => [getRegionId(r), r])
);

const config = {
  cloudRegions: cloudRegions,
  environmentdScheme: currentStack === "local" ? "http" : "https",
  fronteggUrl: getFronteggUrl(currentStack),
  launchDarklyKey: __LAUNCH_DARKLY_KEY__,
  recoilDuplicateCheckingEnabled:
    __RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED__,
  segmentApiKey: __SEGMENT_API_KEY__,
  sentryDsn: __SENTRY_DSN__,
  sentryEnvironment: __SENTRY_ENVIRONMENT__,
  sentryRelease: __SENTRY_RELEASE__,
  statuspageId: __STATUSPAGE_ID__,
};

export type GlobalConfig = typeof config;

export default config;
