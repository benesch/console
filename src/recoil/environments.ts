import { useInterval } from "@chakra-ui/react";
import { add, formatDuration } from "date-fns";
import deepEqual from "fast-deep-equal";
import { ApiError } from "openapi-typescript-fetch";
import React from "react";
import {
  atom,
  selector,
  selectorFamily,
  useRecoilState_TRANSITION_SUPPORT_UNSTABLE,
  useSetRecoilState,
} from "recoil";

import { getRegionId } from "~/cloudRegions";

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
import storageAvailable from "../utils/storageAvailable";
import keys from "./keyConstants";

/** Details about errors fetching environment health. */
export interface EnvironmentError {
  message: string;
  details?: ApiError | Error;
}

/** The health of an environment. */
export type EnvironmentHealth = "pending" | "booting" | "healthy" | "crashed";

/** Represents an environment whose existence is loading. */
export interface LoadingEnvironment {
  state: "loading";
}

/** Represents an environment that is known to be disabled. */
export interface DisabledEnvironment {
  state: "disabled";
  errors: EnvironmentError[];
}

/** Represents an environment that is known to exist. */
export interface EnabledEnvironment extends ApiEnvironment {
  state: "enabled";
  health: EnvironmentHealth;
  errors: EnvironmentError[];
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
  const assignmentMap = new Map<
    string,
    { assignments?: EnvironmentAssignment[]; error?: EnvironmentError }
  >();
  for (const region of config.cloudRegions.values()) {
    try {
      const response = await environmentAssignmentList(
        region.regionControllerUrl,
        accessToken
      );
      assignmentMap.set(getRegionId(region), { assignments: response.data });
    } catch (error) {
      assignmentMap.set(getRegionId(region), {
        error: {
          message: "Listing environment assignments failed",
          details: error as Error,
        },
      });
    }
  }
  for (const [regionId, assignmentResult] of assignmentMap.entries()) {
    // Default to disabled state
    // There is a brief time when a region is enabled where we have an assignment,
    // but the environmentList call still returns nothing
    result.set(regionId, { state: "disabled", errors: [] });

    if (assignmentResult.error) {
      result.set(regionId, {
        state: "disabled",
        errors: [assignmentResult.error],
      });
      continue;
    }
    if (
      !assignmentResult?.assignments ||
      assignmentResult.assignments.length === 0
    ) {
      result.set(regionId, {
        state: "disabled",
        errors: [],
      });
      continue;
    }
    if (assignmentResult?.assignments.length > 1) {
      throw new Error(
        `region ${regionId} unexpectedly had ${assignmentResult.assignments.length} environment assignments`
      );
    }
    const assignment = assignmentResult.assignments[0];

    let envs: ApiEnvironment[] | undefined = undefined;
    const errors: EnvironmentError[] = [];
    try {
      const { data } = await environmentList(
        assignment.environmentControllerUrl,
        accessToken
      );
      if (data.length === 0) {
        continue;
      }
      envs = data;
    } catch (e) {
      errors.push({
        message: "Listing environments failed",
        details: e as Error,
      });
    }
    if (!envs) {
      result.set(regionId, {
        state: "disabled",
        errors,
      });
      continue;
    }
    if (envs.length > 1) {
      errors.push({
        message: `Unexpected error: environment assignment for ${assignment.cluster} unexpectedly had ${envs.length} environments`,
      });
    }

    const envResult = {
      ...envs[0],
      state: "enabled",
      health: "pending",
      errors: [],
    } as EnabledEnvironment;
    const { health, errors: healthErrors } = await fetchEnvironmentHealth(
      envResult,
      accessToken
    );
    result.set(regionId, {
      ...envResult,
      health,
      errors: errors.concat(healthErrors),
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
// Ensure only a single instance of useEnvironmentsWithHealth will poll
let isPollingEnvironmentHealth = false;

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
    let mapChanged = false;
    for (const [key, newValue] of newEnvMap.entries()) {
      if (!deepEqual(environmentMap.get(key), newValue)) {
        environmentMap.set(key, newValue);
        mapChanged = true;
      }
    }
    if (mapChanged) {
      setValue(newEnvMap);
    }
    return environmentMap;
  };

  const [pollingInterval, setPollingInterval] = React.useState<number | null>(
    null
  );

  React.useEffect(() => {
    if (!isPollingEnvironmentHealth && options.intervalMs) {
      isPollingEnvironmentHealth = true;
      setPollingInterval(options?.intervalMs);
    }
    return () => {
      if (pollingInterval) {
        // If the instance that is polling unmounts, let another instance poll
        isPollingEnvironmentHealth = false;
        setPollingInterval(null);
      }
    };
  }, [options.intervalMs, pollingInterval]);

  useInterval(async () => {
    updateValue(await fetchEnvironmentsWithHealth(accessToken));
  }, pollingInterval);
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
  const errors: EnvironmentError[] = [];
  try {
    if (!environment.resolvable) {
      throw new Error(`environment unresolvable`);
    }
    const { errorMessage } = await executeSql(
      environment,
      {
        queries: [{ query: "SELECT 1", params: [] }],
        cluster: "mz_introspection",
      },
      accessToken,
      { signal: controller.signal }
    );
    if (errorMessage !== null) {
      errors.push({
        message: "Environmentd health check failed",
      });
      errors.push({
        message: errorMessage,
      });
      health = "crashed";
    } else {
      health = "healthy";
    }
  } catch (e) {
    // Threshold for considering an environment to be stuck / crashed
    const cutoff = add(new Date(environment.creationTimestamp), maxBoot);
    if (new Date() > cutoff) {
      errors.push({
        message: `Environment not healthy for more than ${formatDuration(
          maxBoot
        )} after creation`,
        details: e as Error,
      });
      health = "crashed";
    } else {
      health = "booting";
    }
  }
  clearTimeout(timeout);
  return { health, errors };
};

export const defaultRegion = () => {
  if (storageAvailable("localStorage")) {
    const region = window.localStorage.getItem(SELECTED_REGION_KEY);
    if (region && config.cloudRegions.has(region)) {
      return region;
    }
  }
  return config.cloudRegions.keys().next().value;
};

/** The ID of the currently selected environment. */
export const currentEnvironmentIdState = atom<string>({
  key: keys.CURRENT_ENVIRONMENT_ID,
  default: defaultRegion(),
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
