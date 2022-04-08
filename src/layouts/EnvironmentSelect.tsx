import { Select } from "@chakra-ui/react";
import * as React from "react";
import { useRecoilState } from "recoil";

import { useRegionsList } from "../api/backend";
import currentEnvironment from "../recoil/currentEnvironment";

const useEnvironmentOptions = () => {
  // TODO someday we'll have an actual endpoint for environments instead of munging regions :P
  const getRegionsOperation = useRegionsList({
    providerName: "AWS", // TODO remove hard-coded provider once "All" no longer an option
  });

  return (getRegionsOperation.data ?? []).map(
    (region) => `${region.provider} ${region.region}`
  );
};

const EnvironmentSelectField = () => {
  const [current, setCurrent] = useRecoilState(currentEnvironment);
  const options = useEnvironmentOptions();

  return (
    <Select
      aria-label="Environment"
      name="environment-select"
      value={current}
      onChange={(e) => setCurrent(e.target.value)}
      disabled={options.length < 1}
    >
      {/* TODO remove "All" once we remove visibility across environments */}
      {["All", ...options].map((env) => (
        <option key={env} value={env} data-testid="environment-option">
          {env}
        </option>
      ))}
    </Select>
  );
};

export default EnvironmentSelectField;
