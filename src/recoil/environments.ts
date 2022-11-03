import { atom, atomFamily, selector } from "recoil";

import { Environment as ApiEnvironment } from "../api/environmentController";
import config from "../config";
import keys from "./keyConstants";

/** The health of an environment. */
export type EnvironmentHealth = "pending" | "booting" | "healthy" | "crashed";

/** Represents an environment whose existence is loading. */
export interface LoadingEnvironment {
  state: "loading";
}

/** Represents an environment that is known to be disabled. */
export interface DisabledEnvironment {
  state: "disabled";
}

/** Represents an environment that is known to exist. */
export interface EnabledEnvironment extends ApiEnvironment {
  state: "enabled";
  health: EnvironmentHealth;
}

export type Environment =
  | LoadingEnvironment
  | DisabledEnvironment
  | EnabledEnvironment;
export type LoadedEnvironment = DisabledEnvironment | EnabledEnvironment;

/** The state for each environment. */
export const environmentState = atomFamily<Environment, string>({
  key: keys.ENVIRONMENTS,
  // All environments are initially marked as loading.
  default: () => ({ state: "loading" }),
});

/** A map of all loaded environments, keyed by environment ID, or null if any
 *  of the environments are still loading.
 */
export const loadedEnvironmentsState = selector<Map<
  string,
  LoadedEnvironment
> | null>({
  key: keys.LOADED_ENVIRONMENTS,
  get: ({ get }) => {
    const environments = new Map();
    for (const regionId of config.cloudRegions.keys()) {
      const environment = get(environmentState(regionId));
      if (environment.state === "loading") {
        return null;
      }
      environments.set(regionId, environment);
    }
    return environments;
  },
});

/** The ID of the currently selected environment. */
export const currentEnvironmentIdState = atom<string>({
  key: keys.CURRENT_ENVIRONMENT_ID,
  default: config.cloudRegions.keys().next().value,
});

/** The state for the currently selected environment. */
export const currentEnvironmentState = selector<Environment>({
  key: keys.CURRENT_ENVIRONMENT,
  get: ({ get }) => {
    const currentEnvironmentId = get(currentEnvironmentIdState);
    return get(environmentState(currentEnvironmentId));
  },
});
