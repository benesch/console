import { useInterval } from "@chakra-ui/react";
import { add } from "date-fns";
import { atom, atomFamily, selectorFamily, useRecoilState } from "recoil";

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

export const environmentDetails = selectorFamily({
  key: "environmentDetails",
  get:
    ({
      environmentControllerUrl,
      accessToken,
    }: {
      environmentControllerUrl: string;
      accessToken: string;
    }) =>
    async () => {
      const response = await environmentList(
        environmentControllerUrl,
        accessToken
      );
      return response.data;
    },
});

export const maybeEnvironment = selectorFamily({
  key: "maybeEnvironment",
  get:
    ({
      environmentControllerUrl,
      accessToken,
    }: {
      environmentControllerUrl: string | undefined;
      accessToken: string;
    }) =>
    async ({ get }) => {
      if (environmentControllerUrl) {
        return get(
          environmentDetails({ environmentControllerUrl, accessToken })
        );
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

export const fetchEnvironmentsWithHealth = async (accessToken: string) => {
  const result = new Map<string, LoadedEnvironment>();
  const assignmentMap = new Map<string, EnvironmentAssignment[]>();
  for (const region of config.cloudRegions.values()) {
    const response = await environmentAssignmentList(
      region.regionControllerUrl,
      accessToken
    );
    assignmentMap.set(getRegionId(region), response.data);
  }
  for (const [regionId, assignments] of assignmentMap.entries()) {
    if (assignments.length === 0) {
      result.set(regionId, { state: "disabled" });
    }
    for (const { environmentControllerUrl } of assignments) {
      const { data: envs } = await environmentList(
        environmentControllerUrl,
        accessToken
      );

      for (const env of envs) {
        const enabledEnv: EnabledEnvironment = {
          ...env,
          state: "enabled",
          health: "pending",
        };
        const health = await fetchEnvironmentHealth(enabledEnv, accessToken);
        result.set(regionId, {
          ...enabledEnv,
          health,
        });
      }
    }
  }
  return result;
};

export const environmentsWithHealth = atomFamily<
  Map<string, LoadedEnvironment> | undefined,
  string
>({
  key: "environmentsWithHealth",
  default: () => undefined,
});

export const useEnvironmentsWithHealth = (
  accessToken: string,
  options: { intervalMs?: number } = {}
) => {
  const [value, setValue] = useRecoilState(environmentsWithHealth(accessToken));

  if (options.intervalMs) {
    useInterval(
      async () => setValue(await fetchEnvironmentsWithHealth(accessToken)),
      options.intervalMs
    );
  }
  if (value) {
    return value;
  }

  throw new Promise((resolve) => {
    fetchEnvironmentsWithHealth(accessToken).then((result) => {
      setValue(result);
      resolve(result);
    });
  });
};

const fetchEnvironmentHealth = async (
  environment: EnabledEnvironment,
  accessToken: string
) => {
  // Determine if the environment is healthy by issuing a basic SQL query.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000 /* 10 seconds */);
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
    const cutoff = add(new Date(environment.creationTimestamp), maxBootTime);
    if (new Date() > cutoff) {
      health = "crashed";
    } else {
      health = "booting";
    }
  }
  clearTimeout(timeout);
  return health;
};

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
      if (!envs) return undefined;
      return envs.get(currentEnvironmentId);
    },
});
