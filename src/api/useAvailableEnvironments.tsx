import { useInterval } from "@chakra-ui/react";
import React from "react";
import { useRecoilState } from "recoil";
import { GetDataError } from "restful-react";

import {
  activeEnvironmentList,
  ActiveRegionEnvironment,
  currentEnvironment,
  environmentList,
  EnvironmentStatus,
  environmentStatusMap,
  RegionEnvironment,
} from "../recoil/environments";
import {
  FetchAuthedType,
  hasEnvironmentReadPermission,
  hasEnvironmentWritePermission,
  useAuth,
} from "./auth";
import { SupportedCloudRegion, useCloudProvidersList } from "./backend";
import { Environment } from "./environment-controller";
import { executeSql, Results } from "./materialized";
import { EnvironmentAssignment } from "./region-controller";
import { getStatusFromSQLResponse } from "./useEnvironmentState";

type AvailableEnvironmentsData = {
  environments: RegionEnvironment[] | null;
  activeEnvironments: RegionEnvironment[] | null;
  statusMap: { [key: string]: EnvironmentStatus };
  current: RegionEnvironment | null;
  refetch: () => void;
  canReadEnvironments: boolean;
  canWriteEnvironments: boolean;
  error: {
    message: string;
    data: {
      providerError: GetDataError<unknown> | null;
      regionEnvErrors: string | null;
    };
  };
};

/*
 * Get all activateable environments across providers.
 * This first contacts all providers' regionControllerUrl to get their environment assignor(s).
 * Then it contacts those assignors via their environmentControllerUrl to get the actual environments.
 */
const useAvailableEnvironments = (): AvailableEnvironmentsData => {
  const { user, fetchAuthed } = useAuth();
  const canReadEnvironments = hasEnvironmentReadPermission(user);
  const canWriteEnvironments = hasEnvironmentWritePermission(user);
  const [current, setCurrent] = useRecoilState(currentEnvironment);
  const [environments, setEnvironments] = useRecoilState(environmentList);
  const [activeEnvironments, setActiveEnvironments] = useRecoilState(
    activeEnvironmentList
  );
  const [statusMap, setStatusMap] = useRecoilState(environmentStatusMap);
  const hasPingedSet = React.useRef<Set<string>>(new Set());
  const {
    data: regions,
    error,
    refetch: refetchProviders,
  } = useCloudProvidersList({});

  const envErrorMessages = [];
  let regionEnvErrorMessage = "";

  const fetchEnvStatuses = React.useCallback(() => {
    if (environments) {
      environments.map(async (env) => {
        let newStatus: EnvironmentStatus = "Not enabled";
        let data: Results | null = null;
        const idString = `${env.region.provider}/${env.region.region}`;
        if (env.env?.environmentdHttpsAddress) {
          if (!hasPingedSet.current.has(idString)) {
            setStatusMap((currentStatusMap) => {
              return {
                ...currentStatusMap,
                [idString]: "Loading",
              };
            });
          }
          executeSql(
            env.env.environmentdHttpsAddress,
            "SELECT 1",
            fetchAuthed
          ).then(({ results }) => {
            data = results;
            newStatus = getStatusFromSQLResponse(
              data,
              env?.env,
              hasPingedSet.current.has(idString)
            );
            setStatusMap((currentStatusMap) => {
              return {
                ...currentStatusMap,
                [idString]: newStatus,
              };
            });
          });

          hasPingedSet.current.add(idString);
        } else {
          newStatus = getStatusFromSQLResponse(
            data,
            env?.env,
            hasPingedSet.current.has(idString)
          );
          setStatusMap((currentStatusMap) => {
            return {
              ...currentStatusMap,
              [idString]: newStatus,
            };
          });
        }
      });
    }
  }, [environments, hasPingedSet, fetchAuthed]);

  const fetchRegionEnvironments = React.useCallback(
    async (region: SupportedCloudRegion): Promise<RegionEnvironment[]> => {
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
    if (!regions) return;

    const envs = await (await Promise.all(regions.map(fetchRegionEnvironments)))
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
  }, [regions, current, setCurrent, fetchRegionEnvironments]);

  React.useEffect(() => {
    fetchAllEnvironments();
  }, [regions]);

  React.useEffect(() => {
    fetchEnvStatuses();
  }, [environments]);

  if (error || regionEnvErrorMessage) {
    console.warn(
      `${
        error && error?.message ? `${error.message}, ` : ""
      }${regionEnvErrorMessage}`
    );
  }

  const refetch = React.useCallback(async () => {
    await refetchProviders();
    fetchAllEnvironments();
  }, [refetchProviders, fetchAllEnvironments, fetchEnvStatuses]);

  useInterval(refetch, 5000);
  useInterval(fetchEnvStatuses, 5000);

  return {
    environments: canReadEnvironments ? environments : [],
    activeEnvironments: canReadEnvironments ? activeEnvironments : [],
    statusMap,
    current,
    refetch,
    canReadEnvironments,
    canWriteEnvironments,
    error: {
      message: `${
        error && error?.message ? `${error.message}, ` : ""
      }${regionEnvErrorMessage}`,
      data: {
        providerError: error,
        regionEnvErrors: regionEnvErrorMessage,
      },
    },
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
  region: SupportedCloudRegion,
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

export default useAvailableEnvironments;
