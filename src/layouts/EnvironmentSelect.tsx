import { Select, Spinner } from "@chakra-ui/react";
import * as React from "react";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";

import { useAuth } from "../api/auth";
import { SupportedCloudRegion, useCloudProvidersList } from "../api/backend";
import { Environment } from "../api/environment-controller";
import {
  currentEnvironment,
  RegionEnvironment,
} from "../recoil/currentEnvironment";

const EnvironmentSelectField = () => {
  const { fetchAuthed } = useAuth();
  const [current, setCurrent] = useRecoilState(currentEnvironment);
  const [environments, setEnvironments] = useState<RegionEnvironment[] | null>(
    null
  );

  const { data: regions } = useCloudProvidersList({});

  async function fetchRegionEnvironments(region: SupportedCloudRegion) {
    const res = await fetchAuthed(
      `${region.environmentControllerUrl}/api/environment`
    );
    const environments: Environment[] = JSON.parse(await res.text());
    return environments.map((e) => ({
      provider: region.provider,
      region: region.region,
      address: e.coordd_address,
    }));
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

  useEffect(() => {
    fetchAllEnvironments();
  }, [regions]);

  if (environments === null) {
    return <Spinner />;
  }

  const options: string[] = [];

  return (
    <Select
      aria-label="Environment"
      name="environment-select"
      value={current?.address || ""}
      onChange={(e) =>
        setCurrent(
          environments.find((env) => e.target.value === env.address) || null
        )
      }
      disabled={environments.length < 1}
    >
      {environments.map((e) => (
        <option
          key={e.address}
          value={e.address}
          data-testid="environment-option"
        >
          {e.provider}/{e.region}
        </option>
      ))}
    </Select>
  );
};

export default EnvironmentSelectField;
