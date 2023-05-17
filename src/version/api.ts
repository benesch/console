import { parse as semverParse, SemVer } from "semver";

import config from "../config";

export const currentConsoleVersion = config?.sentryRelease;

export const consoleVersionHeaders = (): Record<string, string> =>
  currentConsoleVersion && currentConsoleVersion.length > 0
    ? {
        "X-MATERIALIZE-VERSION": currentConsoleVersion,
      }
    : {};

export interface DbVersion {
  crateVersion: SemVer;
  sha: string;
}

const parseDbVersionInner = (versionStr: string): DbVersion | null => {
  const parsed = versionStr.match(
    /^v(?<crateVersion>[^()]*)\((?<sha>[0-9a-fA-F]*)\)$/
  );
  if (parsed?.groups) {
    const { crateVersion, sha } = parsed.groups;
    const crateVersionParsed = semverParse(crateVersion);
    if (!crateVersionParsed) {
      return null;
    }
    return {
      crateVersion: crateVersionParsed,
      sha,
    };
  }
  return null;
};

/** Parses a string returned by `mz_version()`,
 * which is of the form "v<crate-version> (<sha>)`,
 * where <crate-version> is syntactically a semver object.
 * Throws an error if the version string could not be parsed.
 */
export const parseDbVersion = (versionStr: string): DbVersion => {
  const parsed = parseDbVersionInner(versionStr);
  if (!parsed) {
    throw new Error(`Failed to parse database version: ${versionStr}`);
  }
  return parsed;
};
