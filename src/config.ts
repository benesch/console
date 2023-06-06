/* Globals injected by Webpack's DefinePlugin.*/

import { buildCloudRegions, getRegionId } from "~/cloudRegions";

import storageAvailable from "./utils/storageAvailable";

const currentStackKey = "mz-current-stack";

export const getCurrentStack = (
  hostname: string,
  defaultStack: string = __DEFAULT_STACK__
) => {
  if (__FORCE_OVERRIDE_STACK__) {
    return __FORCE_OVERRIDE_STACK__;
  }
  if (storageAvailable("localStorage")) {
    const stack = window.localStorage.getItem(currentStackKey);
    if (stack) {
      return stack;
    }
  }
  if (hostname.startsWith("staging") || hostname.match(/^.*\.preview/)) {
    // matches staging.console.materialize.com or *.preview.console.materialize.com
    return "staging";
  }
  const personalStackMatch = hostname.match(/^\w*\.(staging|dev)/);
  if (personalStackMatch) {
    // personal stack, return $USER.$ENV
    return personalStackMatch[0];
  }
  return defaultStack;
};

export const getLaunchDarklyKey = (hostname: string) => {
  if (hostname === "console.materialize.com") {
    // Production key
    return "63604cf8f9860a0c1f3c7099";
  }
  if (hostname.startsWith("staging") || hostname.match(/^.*\.preview/)) {
    // matches staging.console.materialize.com or *.preview.console.materialize.com
    // Staging key
    return "6388e8a24ac9d112339757f3";
  }

  // Fall back to development key
  return "6388e8b9750ee71144183456";
};

export const setCurrentStack = (stackName: string) => {
  if (storageAvailable("localStorage")) {
    window.localStorage.setItem(currentStackKey, stackName);
  }
};

export const getFronteggUrl = (stack: string) => {
  if (stack === "production") {
    return `https://admin.cloud.materialize.com`;
  }
  if (stack === "local") {
    // local development again cloud services uses staging frontegg
    return `https://admin.staging.cloud.materialize.com`;
  }
  return `https://admin.${stack}.cloud.materialize.com`;
};

export const getSyncServerUrl = (stack: string) => {
  if (stack === "production") {
    return "https://sync.cloud.materialize.com";
  }
  if (stack === "local") {
    return "http://localhost:8003";
  }
  return `https://sync.${stack}.cloud.materialize.com`;
};

const currentStack = getCurrentStack(location.hostname);
const cloudRegions = new Map(
  buildCloudRegions(currentStack).map((r) => [getRegionId(r), r])
);

const config = {
  cloudRegions: cloudRegions,
  environmentdScheme: currentStack === "local" ? "http" : "https",
  fronteggUrl: getFronteggUrl(currentStack),
  launchDarklyKey: getLaunchDarklyKey(location.hostname),
  recoilDuplicateCheckingEnabled:
    __RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED__,
  segmentApiKey: __SEGMENT_API_KEY__,
  sentryDsn: __SENTRY_DSN__,
  sentryEnvironment: __SENTRY_ENVIRONMENT__,
  sentryRelease: __SENTRY_RELEASE__,
  statuspageId: __STATUSPAGE_ID__,
  intercomAppId: __INTERCOM_APP_ID__,
  syncServerUrl: getSyncServerUrl(currentStack),
};

export type GlobalConfig = typeof config;

export default config;
