import { add } from "date-fns";
import { atom, selectorFamily } from "recoil";

import {
  Environment as ApiEnvironment,
  environmentList,
} from "../api/environmentController";
import { executeSqlWithAccessToken } from "../api/materialized";
import {
  EnvironmentAssignment,
  environmentAssignmentList,
} from "../api/regionController";
import config from "../config";
import { getRegionId } from "../types";
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

export const environments = selectorFamily({
  key: "environments",
  get:
    ({
      assignment,
      accessToken,
    }: {
      assignment: EnvironmentAssignment;
      accessToken: string;
    }) =>
    async (_arg) => {
      const response = await environmentList(
        assignment.environmentControllerUrl,
        accessToken
      );
      return response.data;
    },
});

export const maybeEnvironment = selectorFamily({
  key: "maybeEnvironment",
  get:
    ({
      assignment,
      accessToken,
    }: {
      assignment: EnvironmentAssignment | undefined;
      accessToken: string;
    }) =>
    async ({ get }) => {
      if (assignment) {
        return get(environments({ assignment, accessToken }));
      } else {
        return undefined;
      }
    },
});

type FrozenEnvironment = Readonly<EnabledEnvironment>;
export const environmentHealth = selectorFamily({
  key: "environmentHealth",
  get:
    ({
      environment,
      accessToken,
    }: {
      environment: FrozenEnvironment;
      accessToken: string;
    }) =>
    async (_arg) => {
      // Determine if the environment is healthy by issuing a basic SQL query.
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        10000 /* 10 seconds */
      );
      let health: EnvironmentHealth = "pending";
      try {
        if (!environment.resolvable) {
          throw new Error(`environment unresolvable`);
        }
        const { errorMessage } = await executeSqlWithAccessToken(
          environment,
          "SELECT 1",
          accessToken,
          { signal: controller.signal }
        );
        if (errorMessage !== null) {
          throw new Error(`environment unhealthy: ${errorMessage}`);
        }
        health = "healthy";
      } catch (e) {
        // Threshold for considering an environment to be stuck / crashed
        const maxBootTime = { minutes: 5 };
        const cutoff = add(
          new Date(environment.creationTimestamp),
          maxBootTime
        );
        if (new Date() > cutoff) {
          health = "crashed";
        } else {
          health = "booting";
        }
      }
      clearTimeout(timeout);
      return health;
    },
});

export const environmentAssignmentState = selectorFamily({
  key: "environmentAssignmentState",
  get: (accessToken: string) => async (_arg) => {
    const result = new Map<string, EnvironmentAssignment[]>();
    for (const region of config.cloudRegions.values()) {
      const response = await environmentAssignmentList(
        region.regionControllerUrl,
        accessToken
      );
      result.set(getRegionId(region), response.data);
    }
    return result;
  },
});

export const environmentsWithHealth = selectorFamily({
  key: "environmentsWithHealth",
  get:
    (accessToken: string) =>
    async ({ get }) => {
      const result = new Map<string, LoadedEnvironment>();
      const assignmentState = get(environmentAssignmentState(accessToken));
      for (const [regionId, assignments] of assignmentState.entries()) {
        if (assignments.length === 0) {
          result.set(regionId, { state: "disabled" });
        }
        for (const assignment of assignments) {
          const envs = get(environments({ assignment, accessToken }));

          for (const env of envs) {
            const enabledEnv: EnabledEnvironment = {
              ...env,
              state: "enabled",
              health: "pending",
            };
            const health = get(
              environmentHealth({ environment: enabledEnv, accessToken })
            );
            result.set(regionId, {
              ...enabledEnv,
              health,
            });
          }
        }
      }
      return result;
    },
});

/** The ID of the currently selected environment. */
export const currentEnvironmentIdState = atom<string>({
  key: keys.CURRENT_ENVIRONMENT_ID,
  default: config.cloudRegions.keys().next().value,
});

/** The state for the currently selected environment. */
export const currentEnvironmentState = selectorFamily({
  key: keys.CURRENT_ENVIRONMENT,
  get:
    (accessToken: string) =>
    ({ get }) => {
      const currentEnvironmentId = get(currentEnvironmentIdState);
      const envs = get(environmentsWithHealth(accessToken));
      return envs.get(currentEnvironmentId);
    },
});
