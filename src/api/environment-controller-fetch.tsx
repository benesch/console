import { useInterval } from "@chakra-ui/react";
import React from "react";
import { useRecoilState } from "recoil";

import {
  currentEnvironment,
  environmentList,
  RegionEnvironment,
} from "../recoil/environments";
import {
  hasEnvironmentReadPermission,
  hasEnvironmentWritePermission,
  useAuth,
} from "./auth";
import { SupportedCloudRegion, useCloudProvidersList } from "./backend";
import { Environment } from "./environment-controller";
import { EnvironmentAssignment } from "./region-controller";

/* eslint-disable import/prefer-default-export */
/*
 * Get all active environments across providers.
 * This first contacts all providers' regionControllerUrl to get their environment assignor(s).
 * Then it contacts those assignors via their environmentControllerUrl to get the actual environments.
 */
export const useEnvironments = () => {
  const { user, fetchAuthed } = useAuth();
  const canReadEnvironments = hasEnvironmentReadPermission(user);
  const canWriteEnvironments = hasEnvironmentWritePermission(user);
  const [current, setCurrent] = useRecoilState(currentEnvironment);
  const [environments, setEnvironments] = useRecoilState(environmentList);
  const {
    data: regions,
    error,
    refetch: refetchProviders,
  } = useCloudProvidersList({});

  let regionEnvErrorMessage = "";

  const fetchEnvironments = React.useCallback(
    async (assignment: EnvironmentAssignment): Promise<Environment[]> => {
      try {
        const envsResponse = await fetchAuthed(
          `${assignment.environmentControllerUrl}/api/environment`
        );

        if (envsResponse.status === 200) {
          const envs: Environment[] = JSON.parse(await envsResponse.text());
          return envs;
        } else {
          regionEnvErrorMessage += `Fetch environment ${assignment.environmentControllerUrl} failed: ${envsResponse.status} ${envsResponse.statusText}. `;
          return [];
        }
      } catch (err) {
        console.error("Error fetching environments: ", err);
        return [];
      }
    },
    [fetchAuthed]
  );

  const fetchRegionEnvironments = React.useCallback(
    async (region: SupportedCloudRegion): Promise<RegionEnvironment[]> => {
      try {
        // get all env assignments for this provider
        const assignmentResponse = await fetchAuthed(
          `${region.regionControllerUrl}/api/environmentassignment`
        );
        if (assignmentResponse.status === 200) {
          const envAssignments: EnvironmentAssignment[] = JSON.parse(
            await assignmentResponse.text()
          );
          if (envAssignments.length === 0) {
            return [];
          } else {
            const envs = await Promise.all(
              // now we turn those assignments into envs...
              envAssignments.map(async (assignment) => {
                const envs = await fetchEnvironments(assignment);
                // ...and frob the data into fully-fledged RegionEnvironments!
                return envs.map((env) => ({
                  ...env,
                  ...assignment,
                  ...region,
                }));
              })
            );
            return envs.flat();
          }
        } else {
          regionEnvErrorMessage += `Fetch region ${region.provider} environment assignments failed: ${assignmentResponse.status} ${assignmentResponse.statusText}. `;
          return [];
        }
      } catch (err) {
        console.error("Error fetching environments: ", err);
      }
      return [];
    },
    [fetchAuthed, fetchEnvironments]
  );

  const fetchAllEnvironments = React.useCallback(async () => {
    if (!regions) return;

    const envs = await (
      await Promise.all(regions.map(fetchRegionEnvironments))
    ).flat();
    if (current === null && envs.length > 0) {
      setCurrent(envs[0]);
    }

    setEnvironments(envs);
  }, [regions, fetchRegionEnvironments]);

  React.useEffect(() => {
    fetchAllEnvironments();
  }, [regions]);

  if (error || regionEnvErrorMessage) {
    console.warn(
      `${
        error && error?.message ? `${error.message}, ` : ""
      }${regionEnvErrorMessage}`
    );
  }

  const refetch = React.useCallback(async () => {
    await refetchProviders();
    await fetchAllEnvironments();
  }, [refetchProviders, fetchAllEnvironments]);

  useInterval(refetch, 5000);

  return {
    environments,
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
/* eslint-enable import/prefer-default-export */
