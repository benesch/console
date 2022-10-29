import { useInterval } from "@chakra-ui/react";
import { add } from "date-fns";
import React from "react";
import { useRecoilState } from "recoil";
import { GetDataError } from "restful-react";

import config from "../config";
import {
  activeEnvironmentList,
  ActiveRegionEnvironment,
  currentEnvironment,
  environmentList,
  EnvironmentStatus,
  environmentStatusMap,
  firstEnvLoad,
  getRegionId,
  RegionEnvironment,
} from "../recoil/environments";
import { CloudRegion } from "../types";
import { FetchAuthedType, useAuth } from "./auth";
import { Environment } from "./environment-controller";
import { executeSql, Results } from "./materialized";
import { EnvironmentAssignment } from "./region-controller";

type EnvironmentGetterResults = {
  refetch: () => void;
};

// Threshold for considering an environment to be stuck / crashed
const maxBootTime = { minutes: 5 };

/*
 * Get all activateable environments across providers.
 * This first contacts all providers' regionControllerUrl to get their environment assignor(s).
 * Then it contacts those assignors via their environmentControllerUrl to get the actual environments.
 */
const useAvailableEnvironments = (): EnvironmentGetterResults => {
  const { fetchAuthed } = useAuth();
  const [current, setCurrent] = useRecoilState(currentEnvironment);
  const [environments, setEnvironments] = useRecoilState(environmentList);
  const [_, setActiveEnvironments] = useRecoilState(activeEnvironmentList);
  const [statusMap, setStatusMap] = useRecoilState(environmentStatusMap);
  const hasPingedSet = React.useRef<Set<string>>(new Set());
  const [hasLoaded, setHasLoaded] = useRecoilState(firstEnvLoad);

  const envErrorMessages = [];
  let regionEnvErrorMessage = "";

  const fetchEnvStatuses = React.useCallback(() => {
    if (environments) {
      environments.map(async (env) => {
        let newStatus: EnvironmentStatus = "Not enabled";
        const idString = getRegionId(env.region);
        if (env.env?.resolvable && env.env?.environmentdHttpsAddress) {
          if (statusMap[idString] === "Not enabled") {
            // go from not enabled to loading
            newStatus = getStatusFromSQLResponse(
              null,
              env.env,
              hasPingedSet.current.has(idString)
            );
          }
          try {
            const { results } = await executeSql(
              env.env,
              "SELECT 1",
              fetchAuthed
            );
            newStatus = getStatusFromSQLResponse(
              results,
              env?.env,
              hasPingedSet.current.has(idString)
            );
          } catch {
            newStatus = getStatusFromSQLResponse(null, env?.env, true);
          }
          if (!hasPingedSet.current.has(idString)) {
            hasPingedSet.current.add(idString);
          }
        } else if (env && env.env && !env.env.resolvable) {
          if (env.env.creationTimestamp) {
            const cutoff = add(
              new Date(env.env.creationTimestamp),
              maxBootTime
            );

            if (new Date() > cutoff) {
              newStatus = "Crashed";
            } else {
              newStatus = "Starting";
            }
          }
        } else {
          newStatus = getStatusFromSQLResponse(
            null,
            env?.env,
            hasPingedSet.current.has(idString)
          );
        }
        setStatusMap((currentStatusMap) => {
          return {
            ...currentStatusMap,
            [idString]: newStatus,
          };
        });
      });
    }
  }, [environments, hasPingedSet, fetchAuthed]);

  const fetchRegionEnvironments = React.useCallback(
    async (region: CloudRegion): Promise<RegionEnvironment[]> => {
      const { assignments, errorMessage } = await fetchEnvironmentAssignments(
        region,
        fetchAuthed
      );
      regionEnvErrorMessage = errorMessage;
      if (assignments.length > 0) {
        const activeEnvs = await Promise.all(
          // now we turn those assignments into envs...
          assignments.map(async (assignment) => {
            const { environments: envs, errorMessage } =
              await fetchEnvironments(assignment, fetchAuthed);
            errorMessage && envErrorMessages.push(errorMessage);
            // ...and frob the data into fully-fledged RegionEnvironments!
            return envs.map((env) => {
              return {
                env,
                assignment,
                region,
              };
            });
          })
        );
        return activeEnvs.flat();
      }
      return [{ region }];
    },
    [fetchAuthed, fetchEnvironments]
  );

  const fetchAllEnvironments = React.useCallback(async () => {
    const envs = await (
      await Promise.all(config.cloudRegions.map(fetchRegionEnvironments))
    )
      .flat()
      .sort((a, b) => {
        // sort first by provider, then by region
        const providerComparison = a.region.provider
          .toLowerCase()
          .localeCompare(b.region.provider.toLowerCase());
        if (providerComparison === 0) {
          return a.region.region
            .toLowerCase()
            .localeCompare(b.region.region.toLowerCase());
        } else {
          return providerComparison;
        }
      });
    const activeEnvs = envs.filter(
      (env) => !!env.env && !!env.assignment
    ) as ActiveRegionEnvironment[];
    if (current) {
      // update the current atom with the contents of the env
      const updatedCurrent = envs.find((env) => {
        return (
          env.region.provider === current.region.provider &&
          env.region.region === current.region.region
        );
      });
      setCurrent(updatedCurrent || null);
    } else if (activeEnvs.length > 0) {
      // set the current env to the first active env, if there is one
      setCurrent(activeEnvs[0]);
    }
    setEnvironments(envs);
    setActiveEnvironments(activeEnvs);
    hasLoaded && setHasLoaded(false);
  }, [current, setCurrent, fetchRegionEnvironments]);

  React.useEffect(() => {
    fetchAllEnvironments();
  }, []);

  React.useEffect(() => {
    fetchEnvStatuses();
  }, [environments]);

  if (regionEnvErrorMessage) {
    console.warn(regionEnvErrorMessage);
  }

  const refetch = React.useCallback(async () => {
    fetchAllEnvironments();
  }, [fetchAllEnvironments, fetchEnvStatuses]);

  useInterval(refetch, 5000);
  useInterval(fetchEnvStatuses, 5000);

  return {
    refetch,
  };
};

export const fetchEnvironments = async (
  assignment: EnvironmentAssignment,
  fetcher: FetchAuthedType
): Promise<{ environments: Environment[]; errorMessage: string }> => {
  let environments: Environment[] = [];
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
    // get all env assignments for this provider
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

const getStatusFromSQLResponse = (
  data?: Results | null,
  env?: Environment | null,
  hasLoadedOnce?: boolean
): EnvironmentStatus => {
  const negativeHealth =
    (env && !env.resolvable) || !data || data.rows.length === 0;

  if (env) {
    if (negativeHealth) {
      if (!hasLoadedOnce) {
        return "Loading";
      } else {
        return "Starting";
      }
    } else {
      return "Enabled";
    }
  }

  return "Not enabled";
};

export default useAvailableEnvironments;
