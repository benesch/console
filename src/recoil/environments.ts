import { add, formatDuration } from "date-fns";
import deepEqual from "fast-deep-equal";
import { ApiError } from "openapi-typescript-fetch";
import React from "react";
import {
  atom,
  selector,
  selectorFamily,
  useRecoilState_TRANSITION_SUPPORT_UNSTABLE,
  useRecoilValue_TRANSITION_SUPPORT_UNSTABLE,
  useSetRecoilState,
} from "recoil";
import { gte as semverGte, parse as semverParse, SemVer } from "semver";

import { getRegionId } from "~/cloudRegions";
import useForegroundInterval from "~/useForegroundInterval";
import { assert } from "~/util";
import { DbVersion, parseDbVersion } from "~/version/api";

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
  status: EnvironmentStatus;
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

    const envResult: EnabledEnvironment = {
      ...envs[0],
      state: "enabled",
      status: { health: "pending" },
    };
    const health = await fetchEnvironmentHealth(envResult, accessToken);
    result.set(regionId, {
      ...envResult,
      status: health,
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
/**
 * True while requests for health are in flight
 */
let isUpdatingEnvironmentHealth = false;

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

  useForegroundInterval(async () => {
    if (!isUpdatingEnvironmentHealth) {
      isUpdatingEnvironmentHealth = true;
      updateValue(await fetchEnvironmentsWithHealth(accessToken));
      isUpdatingEnvironmentHealth = false;
    }
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

export interface HealthyStatus {
  health: "healthy";
  version: DbVersion;
}

export interface UnhealthyStatus {
  health: "crashed";
  errors: EnvironmentError[];
}

export interface BootingStatus {
  health: "booting";
}

export interface PendingStatus {
  health: "pending";
}

export type EnvironmentStatus =
  | HealthyStatus
  | UnhealthyStatus
  | BootingStatus
  | PendingStatus;

export const fetchEnvironmentHealth = async (
  environment: EnabledEnvironment,
  accessToken: string,
  timeoutMs: number = defaultTimeout,
  maxBoot: Duration = maxBootDuration
): Promise<EnvironmentStatus> => {
  // Determine if the environment is healthy by issuing a basic SQL query.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let version: DbVersion | undefined = undefined;
  let healthResult: EnvironmentStatus | null = null;
  try {
    if (!environment.resolvable) {
      throw new Error(`environment unresolvable`);
    }
    const result = await executeSql(
      environment,
      {
        queries: [{ query: "SELECT mz_version()", params: [] }],
        cluster: "mz_introspection",
      },
      accessToken,
      { signal: controller.signal }
    );
    if ("errorMessage" in result) {
      const errors: EnvironmentError[] = [];
      errors.push({
        message: "Environmentd health check failed",
      });
      errors.push({
        message: result.errorMessage,
      });
      healthResult = { health: "crashed", errors };
    } else {
      const versionString = result.results[0].rows[0][0] as string;
      version = parseDbVersion(versionString);
      healthResult = { health: "healthy", version };
    }
  } catch (e) {
    // Threshold for considering an environment to be stuck / crashed
    const cutoff = add(new Date(environment.creationTimestamp), maxBoot);
    if (new Date() > cutoff) {
      const errors: EnvironmentError[] = [];
      errors.push({
        message: `Environment not healthy for more than ${formatDuration(
          maxBoot
        )} after creation`,
        details: e as Error,
      });
      healthResult = { health: "crashed", errors };
    } else {
      healthResult = { health: "booting" };
    }
  }
  clearTimeout(timeout);
  return healthResult;
};

export const environmentErrors = (
  env: LoadedEnvironment
): EnvironmentError[] => {
  switch (env.state) {
    case "disabled":
      return env.errors;
    case "enabled":
      switch (env.status.health) {
        case "crashed":
          return env.status.errors;
      }
  }
  return [];
};

export const defaultRegion = () => {
  let region: string = config.cloudRegions.keys().next().value;
  if (storageAvailable("localStorage")) {
    region = window.localStorage.getItem(SELECTED_REGION_KEY) || region;
    if (!config.cloudRegions.has(region)) {
      // If the selected region isn't valid, update the value in local storage
      region = config.cloudRegions.keys().next().value;
      window.localStorage.setItem(SELECTED_REGION_KEY, region);
    }
  }
  return region;
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

/**
 * Gate code on the current version being greater than or equal to a specified version.
 * The tri-state return-value is true if the current environment version
 * is greater than or equal to the supplied version,
 * false if it is less than the supplied version, and undefined
 * if it can't be found (because there is no current environment or because the current
 * environment is unhealthy).
 *
 * It is recommended to call this function with pre-release semver strings. For example,
 * `useEnvironmentGate("0.55.0-dev")` will return true on v0.55.x and their pre-release builds,
 * but false on v0.54.x
 */
export const useEnvironmentGate = (
  version: string | SemVer
): boolean | null => {
  const suppliedVersion = semverParse(version);
  assert(suppliedVersion);
  const environment = useRecoilValue_TRANSITION_SUPPORT_UNSTABLE(
    currentEnvironmentState
  );
  if (
    environment &&
    environment.state === "enabled" &&
    environment.status.health === "healthy"
  ) {
    const actualVersion = environment.status.version;
    return semverGte(actualVersion.crateVersion, suppliedVersion);
  }
  return null;
};
