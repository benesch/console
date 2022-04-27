import { Select, Spinner } from "@chakra-ui/react";
import * as React from "react";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";

import { SupportedCloudRegion, useCloudProvidersList } from "../api/backend";
import { Environment } from "../api/environment-controller";
import { useEnvironments } from "../api/environment-controller-fetch";
import {
  currentEnvironment,
  RegionEnvironment,
} from "../recoil/currentEnvironment";

const EnvironmentSelectField = () => {
  const [current, setCurrent] = useRecoilState(currentEnvironment);
  const { environments, refetch, error } = useEnvironments();

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
