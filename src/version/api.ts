import config from "../config";

export const currentVersion = config?.sentryRelease;

export const versionHeaders = (): Record<string, string> =>
  currentVersion && currentVersion.length > 0
    ? {
        "X-MATERIALIZE-VERSION": currentVersion,
      }
    : {};
