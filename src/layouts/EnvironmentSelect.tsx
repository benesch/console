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
  const { environments, refetch } = useEnvironments();
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
          (env) => environmentValue === env.environmentd_https_address
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

  return (
    <>
      {environments.length < 1 ? (
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
          value={current?.environmentd_https_address || ""}
          onChange={selectHandler}
        >
          {environments.map((e) => (
            <option
              key={e.environmentd_https_address}
              value={e.environmentd_https_address}
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
  );
};

export default EnvironmentSelectField;
