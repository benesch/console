import React from "react";
import { useRecoilState } from "recoil";

import {
  currentEnvironment,
  RegionEnvironment,
} from "../recoil/currentEnvironment";
import { useAuth } from "./auth";
import { SupportedCloudRegion, useCloudProvidersList } from "./backend";
import { Environment } from "./environment-controller";

/* eslint-disable import/prefer-default-export */
export const useEnvironments = () => {
  const { fetchAuthed } = useAuth();
  const [current, setCurrent] = useRecoilState(currentEnvironment);
  const [environments, setEnvironments] = React.useState<
    RegionEnvironment[] | null
  >(null);
  const {
    data: regions,
    error,
    refetch: refetchProviders,
  } = useCloudProvidersList({});

  let regionEnvErrorMessage = "";

  async function fetchRegionEnvironments(region: SupportedCloudRegion) {
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
      return [];
    }
  }

  async function fetchAllEnvironments() {
    if (!regions) return;

    const environments = (
      await Promise.all(regions.map(fetchRegionEnvironments))
    ).flat();

    if (current === null && environments.length > 0) {
      setCurrent(environments[0]);
    }

    setEnvironments(environments);
  }

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

  return {
    environments,
    current,
    refetch: async () => {
      await refetchProviders();
      await fetchAllEnvironments();
    },
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
