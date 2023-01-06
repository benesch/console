import { useInterval } from "@chakra-ui/react";
import { add } from "date-fns";
import deepEqual from "fast-deep-equal";
import {
  atom,
  selector,
  selectorFamily,
  useRecoilState_TRANSITION_SUPPORT_UNSTABLE,
  useSetRecoilState,
} from "recoil";

import {
  Environment as ApiEnvironment,
  environmentList,
} from "../api/environmentController";
import { executeSql } from "../api/materialized";
import {
  EnvironmentAssignment,
  environmentAssignmentList,
} from "../api/regionController";
import config from "../config";
import { getRegionId } from "../types";
import storageAvailable from "../utils/storageAvailable";
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

export const SELECTED_REGION_KEY = "mz-selected-region";

export const maybeEnvironmentForRegion = selectorFamily({
  key: keys.MAYBE_ENVIRONMENTS_FOR_REGION,
  get:
    ({ regionId }: { regionId: string | undefined }) =>
    async ({ get }) => {
      if (regionId) {
        const environments = get(environmentsWithHealth);
        return environments?.get(regionId);
      } else {
        return undefined;
      }
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
    // Default to disabled state
    // There is a brief time when a region is enabled where we have an assignment,
    // but the environmentList call still returns nothing
    result.set(regionId, { state: "disabled" });

    if (assignments.length === 0) {
      continue;
    }
    if (assignments.length > 1) {
      throw new Error(
        `region ${regionId} unexpectedly had ${assignments.length} environment assignments`
      );
    }
    const assignment = assignments[0];

    const { data: envs } = await environmentList(
      assignment.environmentControllerUrl,
      accessToken
    );
    if (envs.length === 0) {
      continue;
    }
    if (envs.length > 1) {
      throw new Error(
        `environment assignment for ${assignment.cluster} unexpectedly had ${envs.length} environments`
      );
    }

    const env = envs[0];
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
  return result;
};

export type EnvironmentsWithHealth = Map<string, LoadedEnvironment>;
export const environmentsWithHealth = atom<EnvironmentsWithHealth | undefined>({
  key: keys.ENVIRONMENTS_WITH_HEALTH,
  default: undefined,
});

// Ensure we don't issue duplicate environment health queries
let pendingEnvironmentsWithHealth: Promise<EnvironmentsWithHealth> | undefined;

export const useEnvironmentsWithHealth = (
  accessToken: string,
  options: { intervalMs?: number } = {}
) => {
  const [environmentMap, setValue] = useRecoilState_TRANSITION_SUPPORT_UNSTABLE(
    environmentsWithHealth
  );

  // The environment objects are used in dependency arrays,
  // so the refrences need to be stable
  const updateValue = (newEnvMap: Map<string, LoadedEnvironment>) => {
    if (!environmentMap) {
      setValue(newEnvMap);
      return;
    }
    for (const [key, newValue] of newEnvMap.entries()) {
      if (!deepEqual(environmentMap.get(key), newValue)) {
        environmentMap.set(key, newValue);
      }
    }
    return environmentMap;
  };

  useInterval(async () => {
    updateValue(await fetchEnvironmentsWithHealth(accessToken));
  }, options.intervalMs ?? null);
  if (environmentMap) {
    return environmentMap;
  }

  if (pendingEnvironmentsWithHealth) {
    throw pendingEnvironmentsWithHealth;
  } else {
    const promise = new Promise<EnvironmentsWithHealth>((resolve) => {
      fetchEnvironmentsWithHealth(accessToken).then((result) => {
        setValue(result);
        resolve(result);
        pendingEnvironmentsWithHealth = undefined;
      });
    });
    pendingEnvironmentsWithHealth = promise;
    throw promise;
  }
};

const defaultTimeout = 10_000; // 10 seconds
const maxBootDuration = { minutes: 5 };

export const fetchEnvironmentHealth = async (
  environment: EnabledEnvironment,
  accessToken: string,
  timeoutMs: number = defaultTimeout,
  maxBoot: Duration = maxBootDuration
) => {
  // Determine if the environment is healthy by issuing a basic SQL query.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let health: EnvironmentHealth = "pending";
  try {
    if (!environment.resolvable) {
      throw new Error(`environment unresolvable`);
    }
    const { errorMessage } = await executeSql(
      environment,
      "SELECT 1",
      accessToken,
      { signal: controller.signal }
    );
    if (errorMessage !== null) {
      console.warn(`environment unhealthy: ${errorMessage}`);
      health = "crashed";
    } else {
      health = "healthy";
    }
  } catch (e) {
    // Threshold for considering an environment to be stuck / crashed
    const cutoff = add(new Date(environment.creationTimestamp), maxBoot);
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
export const currentEnvironmentState = selector<LoadedEnvironment | undefined>({
  key: keys.CURRENT_ENVIRONMENT,
  get: ({ get }) => {
    const currentEnvironmentId = get(currentEnvironmentIdState);
    const envs = get(environmentsWithHealth);
    if (!envs) return undefined;
    return envs.get(currentEnvironmentId);
  },
});

export const useSetCurrentEnvironment = () => {
  const setCurrentEnvironmentId = useSetRecoilState(currentEnvironmentIdState);
  return (newEnvironmentId: string) => {
    setCurrentEnvironmentId(newEnvironmentId);
    if (storageAvailable("localStorage")) {
      window.localStorage.setItem(SELECTED_REGION_KEY, newEnvironmentId);
    }
  };
};
