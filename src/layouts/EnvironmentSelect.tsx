import {
  ButtonProps,
  Select,
  SelectProps,
  Spinner,
  useInterval,
} from "@chakra-ui/react";
import React, { ChangeEventHandler } from "react";
import { useRecoilState } from "recoil";

import useAvailableEnvironments from "../api/useAvailableEnvironments";
import { currentEnvironment } from "../recoil/environments";

const EnvironmentSelectField = (props: ButtonProps & SelectProps) => {
  const [current, setCurrent] = useRecoilState(currentEnvironment);
  const { environments, activeEnvironments, refetch, canReadEnvironments } =
    useAvailableEnvironments();
  useInterval(refetch, 5000);

  if (!environments || environments.length < 1) {
    return <Spinner />;
  }

  const selectHandler: ChangeEventHandler<HTMLSelectElement> = (e) => {
    const { target } = e;
    const { value: environmentValue } = target;

    setCurrent(
      environments?.find(
        (env) =>
          environmentValue === `${env.region.provider}/${env.region.region}`
      ) || null
    );
  };

  if (
    (activeEnvironments && activeEnvironments.length < 1 && !current) ||
    !canReadEnvironments
  ) {
    return null;
  }

  return (
    <Select
      aria-label="Environment"
      name="environment-select"
      size="md"
      {...props}
      value={
        current ? `${current.region.provider}/${current.region.region}` : ""
      }
      onChange={selectHandler}
    >
      {environments.map(({ region }) => (
        <option
          key={`${region.provider}/${region.region}`}
          value={`${region.provider}/${region.region}`}
          data-testid="environment-option"
        >
          {region.provider}/{region.region}
        </option>
      ))}
    </Select>
  );
};

export default EnvironmentSelectField;
