import { useInterval } from "@chakra-ui/react";
import { add } from "date-fns";
import deepEql from "deep-eql";
import { ApiError } from "openapi-typescript-fetch";
import React from "react";
import { useRecoilCallback } from "recoil";

import config from "../config";
import {
  EnabledEnvironment,
  Environment,
  environmentState,
} from "../recoil/environments";
import { CloudRegion, getRegionId } from "../types";
import { useAuth } from "./auth";
import {
  Environment as ApiEnvironment,
  environmentList,
} from "./environmentController";
import { executeSql } from "./materialized";
import {
  EnvironmentAssignment,
  environmentAssignmentList,
} from "./regionController";

type EnvironmentGetterResults = {
  refetch: () => void;
};

// Threshold for considering an environment to be stuck / crashed
const maxBootTime = { minutes: 5 };

/*
 * Start heartbeating environment existence and health into recoil state.
 *
 * This periodically contacts all region controllers to get their environment
 * assignments, then it contacts the environment controllers to get the
 * environments, and then it contacts the environments themselves to check their
 * health.
 *
 * TODO: figure out how to use Recoil native features for this, instead of this
 * single-use hook.
 */
const useAvailableEnvironments = (): EnvironmentGetterResults => {
  const { fetchAuthed, user } = useAuth();

  const updateEnvironment = useRecoilCallback(
    ({ set }) =>
      (id: string, update: (env: Environment) => Environment) => {
        set(environmentState(id), (oldEnvironment) => {
          const newEnvironment = update(oldEnvironment);
          // Suppress updates when environment hasn't changed, to prevent
          // re-renders.
          return deepEql(oldEnvironment, newEnvironment)
            ? oldEnvironment
            : newEnvironment;
        });
      }
  );

  const setEnvironment = (id: string, environment: Environment) => {
    updateEnvironment(id, () => environment);
  };

  const fetchRegionEnvironments = async (region: CloudRegion) => {
    // Fetch the environment assignment for the region, if it exists.
    const { assignments } = await fetchEnvironmentAssignments(
      region,
      user.accessToken
    );
    if (assignments.length === 0) {
      setEnvironment(getRegionId(region), { state: "disabled" });
      return;
    } else if (assignments.length > 1) {
      console.error(
        `region ${getRegionId(region)} unexpectedly had ${
          assignments.length
        } environment assignments`
      );
      return;
    }
    const assignment = assignments[0];

    // Fetch the environment for the assignment, if it exists.
    const { environments } = await fetchEnvironments(
      assignment,
      user.accessToken
    );
    if (environments.length === 0) {
      return;
    } else if (environments.length > 1) {
      console.error(
        `environment assignment for ${assignment.cluster} unexpectedly had ${environments.length} environments`
      );
      return;
    }

    // Update the state with the new environment object...
    const environment: EnabledEnvironment = {
      state: "enabled",
      health: "pending",
      ...environments[0],
    };
    updateEnvironment(getRegionId(region), (oldEnvironment) => {
      if (oldEnvironment.state === "enabled") {
        // ...but don't overwrite the last health, if it exists.
        environment.health = oldEnvironment.health;
      }
      return { ...environment };
    });

    // Determine if the environment is healthy by issuing a basic SQL query.
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      10000 /* 10 seconds */
    );
    try {
      if (!environment.resolvable) {
        throw new Error(`environment unresolvable`);
      }
      const { errorMessage } = await executeSql(
        environment,
        "SELECT 1",
        fetchAuthed,
        { signal: controller.signal }
      );
      if (errorMessage !== null) {
        throw new Error(`environment unhealthy: ${errorMessage}`);
      }
      environment.health = "healthy";
    } catch (e) {
      const cutoff = add(new Date(environment.creationTimestamp), maxBootTime);
      if (new Date() > cutoff) {
        environment.health = "crashed";
      } else {
        environment.health = "booting";
      }
    }
    clearTimeout(timeout);
    setEnvironment(getRegionId(region), environment);
  };

  const refetch = async () => {
    for (const region of config.cloudRegions.values()) {
      fetchRegionEnvironments(region);
    }
  };

  React.useEffect(() => {
    refetch();
  }, []);

  useInterval(refetch, 5000);

  return {
    refetch,
  };
};

export const fetchEnvironments = async (
  assignment: EnvironmentAssignment,
  accessToken: string
): Promise<{ environments: ApiEnvironment[]; errorMessage: string }> => {
  let environments: ApiEnvironment[] = [];
  let envsErrorMessage = "";
  try {
    const response = await environmentList(
      assignment.environmentControllerUrl,
      accessToken
    );
    environments = response.data;
  } catch (err) {
    if (err instanceof ApiError) {
      envsErrorMessage += `Fetch environment ${assignment.environmentControllerUrl} failed: ${err.status} ${err.statusText}. `;
    } else {
      envsErrorMessage += `Fetch environment ${assignment.environmentControllerUrl} failed. `;
      console.error("Error fetching environments: ", err);
    }
  }
  return {
    environments,
    errorMessage: envsErrorMessage,
  };
};

export const fetchEnvironmentAssignments = async (
  region: CloudRegion,
  accessToken: string
): Promise<{ assignments: EnvironmentAssignment[]; errorMessage: string }> => {
  let assignments: EnvironmentAssignment[] = [];
  let envAssignmentsErrorMessage = "";
  try {
    const response = await environmentAssignmentList(
      region.regionControllerUrl,
      accessToken
    );
    assignments = response.data;
  } catch (err) {
    if (err instanceof ApiError) {
      envAssignmentsErrorMessage += `Fetch region ${region.provider} environment assignments failed: ${err.status} ${err.statusText}. `;
    } else {
      envAssignmentsErrorMessage += `Fetch region ${region.provider} environment assignments failed. `;
      console.error("Error fetching environments: ", err);
    }
  }
  return {
    assignments,
    errorMessage: envAssignmentsErrorMessage,
  };
};

export default useAvailableEnvironments;
