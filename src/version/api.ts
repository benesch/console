import { isValidString } from "../utils/validators";

export const currentVersion = window.CONFIG.sentryRelease;

export const versionHeaders = (): Record<string, string> =>
  isValidString(currentVersion)
    ? {
        "X-MATERIALIZE-VERSION": currentVersion,
      }
    : {};
