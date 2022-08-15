import { useInterval } from "@chakra-ui/react";
import React from "react";
import { useRecoilState } from "recoil";

import { currentEnvironment, environmentList } from "../recoil/environments";
import {
  hasEnvironmentReadPermission,
  hasEnvironmentWritePermission,
  useAuth,
} from "./auth";
import { SupportedCloudRegion, useCloudProvidersList } from "./backend";
import { Environment } from "./environment-controller";

/* eslint-disable import/prefer-default-export */
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

  const fetchRegionEnvironments = React.useCallback(
    async (region: SupportedCloudRegion) => {
      try {
        const res = await fetchAuthed(
          `${region.environmentControllerUrl}/api/environment`
        );
        if (res.status === 200) {
          const environments: Environment[] = JSON.parse(await res.text());
          return environments.map((e) => ({
            ...e,
            ...region,
          }));
        } else {
          regionEnvErrorMessage += `Fetch region ${region.provider} failed: ${res.status} ${res.statusText}. `;
          return [];
        }
      } catch (err) {
        console.error("Error fetching environments: ", err);
      }
      return [];
    },
    [fetchAuthed]
  );

  const fetchAllEnvironments = React.useCallback(async () => {
    if (!regions) return;

    const environments = (
      await Promise.all(regions.map(fetchRegionEnvironments))
    ).flat();

    if (current === null && environments.length > 0) {
      setCurrent(environments[0]);
    }

    setEnvironments(environments);
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
