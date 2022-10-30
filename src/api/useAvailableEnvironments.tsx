import { useInterval } from "@chakra-ui/react";
import { add } from "date-fns";
import deepEql from "deep-eql";
import React from "react";
import { SetterOrUpdater, useRecoilCallback, useSetRecoilState } from "recoil";

import config from "../config";
import {
  EnabledEnvironment,
  Environment,
  environmentState,
} from "../recoil/environments";
import { CloudRegion, getRegionId } from "../types";
import { FetchAuthedType, useAuth } from "./auth";
import { Environment as ApiEnvironment } from "./environment-controller";
import { executeSql } from "./materialized";
import { EnvironmentAssignment } from "./region-controller";

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
  const { fetchAuthed } = useAuth();

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
      fetchAuthed
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
    const { environments } = await fetchEnvironments(assignment, fetchAuthed);
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
  fetcher: FetchAuthedType
): Promise<{ environments: ApiEnvironment[]; errorMessage: string }> => {
  let environments: ApiEnvironment[] = [];
  let envsErrorMessage = "";
  try {
    const envsResponse = await fetcher(
      `${assignment.environmentControllerUrl}/api/environment`
    );

    if (envsResponse.status === 200) {
      environments = JSON.parse(await envsResponse.text());
    } else {
      envsErrorMessage += `Fetch environment ${assignment.environmentControllerUrl} failed: ${envsResponse.status} ${envsResponse.statusText}. `;
    }
  } catch (err) {
    console.error("Error fetching environments: ", err);
  }
  return {
    environments,
    errorMessage: envsErrorMessage,
  };
};

export const fetchEnvironmentAssignments = async (
  region: CloudRegion,
  fetcher: FetchAuthedType
): Promise<{ assignments: EnvironmentAssignment[]; errorMessage: string }> => {
  let assignments: EnvironmentAssignment[] = [];
  let envAssignmentsErrorMessage = "";
  try {
    const assignmentResponse = await fetcher(
      `${region.regionControllerUrl}/api/environmentassignment`
    );
    if (assignmentResponse.status === 200) {
      assignments = JSON.parse(await assignmentResponse.text());
    } else {
      envAssignmentsErrorMessage += `Fetch region ${region.provider} environment assignments failed: ${assignmentResponse.status} ${assignmentResponse.statusText}. `;
    }
  } catch (err) {
    console.error("Error fetching environments: ", err);
  }
  return {
    assignments,
    errorMessage: envAssignmentsErrorMessage,
  };
};

export default useAvailableEnvironments;
