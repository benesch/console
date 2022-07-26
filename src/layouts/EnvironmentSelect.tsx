import {
  Button,
  ButtonProps,
  Select,
  SelectProps,
  Spinner,
  useInterval,
} from "@chakra-ui/react";
import React, { ChangeEventHandler, useState } from "react";
import { useRecoilState } from "recoil";

import { useEnvironments } from "../api/environment-controller-fetch";
import EnvironmentListModal from "../platform/environments/EnvironmentsListModal";
import { currentEnvironment } from "../recoil/environments";

const EnvironmentSelectField = (props: ButtonProps & SelectProps) => {
  const [current, setCurrent] = useRecoilState(currentEnvironment);
  const { environments, refetch, canWriteEnvironments, canReadEnvironments } =
    useEnvironments();
  const [modalState, setModalState] = useState(false);
  useInterval(refetch, 5000);
  const editEnvValue = "+ Edit Regions";

  if (environments === null) {
    return <Spinner />;
  }

  const selectHandler: ChangeEventHandler<HTMLSelectElement> = (e) => {
    const { target } = e;
    const { value: environmentValue } = target;

    if (environmentValue === editEnvValue) {
      setModalState(true);
    } else {
      setCurrent(
        environments.find(
          (env) => environmentValue === env.environmentdHttpsAddress
        ) || null
      );
    }
  };

  const closeHandler = () => {
    setModalState(false);
    refetch();
  };

  const enableHandler = () => {
    setModalState(true);
  };

  return canReadEnvironments ? (
    <>
      {environments.length < 1 && canWriteEnvironments ? (
        <>
          <Button
            size="md"
            {...props}
            onClick={enableHandler}
            variant="gradient-1"
          >
            + Enable Region
          </Button>
        </>
      ) : (
        <Select
          aria-label="Environment"
          name="environment-select"
          size="md"
          {...props}
          value={current?.environmentdHttpsAddress || ""}
          onChange={selectHandler}
        >
          {environments.map((e) => (
            <option
              key={e.environmentdHttpsAddress}
              value={e.environmentdHttpsAddress}
              data-testid="environment-option"
            >
              {e.provider}/{e.region}
            </option>
          ))}
          <option
            key="edit_regions"
            value={editEnvValue}
            data-testid="edit-option"
          >
            + Edit Regions
          </option>
        </Select>
      )}
      <EnvironmentListModal isOpen={modalState} onClose={closeHandler} />
    </>
  ) : null;
};

export default EnvironmentSelectField;
