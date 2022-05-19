import { Select, Spinner } from "@chakra-ui/react";
import React from "react";
import { useRecoilState } from "recoil";

import { useEnvironments } from "../api/environment-controller-fetch";
import { currentEnvironment } from "../recoil/currentEnvironment";

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
      value={current?.coordd_address || ""}
      onChange={(e) =>
        setCurrent(
          environments.find((env) => e.target.value === env.coordd_address) ||
            null
        )
      }
      size="sm"
      disabled={environments.length < 1}
    >
      {environments.length < 1 && <option>No regions active</option>}
      {environments.map((e) => (
        <option
          key={e.coordd_address}
          value={e.coordd_address}
          data-testid="environment-option"
        >
          {e.provider}/{e.region}
        </option>
      ))}
    </Select>
  );
};

export default EnvironmentSelectField;
