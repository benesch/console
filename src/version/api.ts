import config from "../config";
import { isValidString } from "../utils/validators";

export const currentVersion = config?.sentryRelease;

export const versionHeaders = (): Record<string, string> =>
  isValidString(currentVersion)
    ? {
        "X-MATERIALIZE-VERSION": currentVersion,
      }
    : {};
