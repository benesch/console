import { Button, Select, Spinner } from "@chakra-ui/react";
import React, { ChangeEventHandler, useState } from "react";
import { useRecoilState } from "recoil";

import { useEnvironments } from "../api/environment-controller-fetch";
import EnvironmentListModal from "../platform/environments/EnvironmentsListModal";
import { currentEnvironment } from "../recoil/currentEnvironment";

const EnvironmentSelectField = () => {
  const [current, setCurrent] = useRecoilState(currentEnvironment);
  const { environments, refetch } = useEnvironments();
  const [state, setState] = useState(false);
  const editEnvironmentValue = "+ Edit Environments";

  if (environments === null) {
    return <Spinner />;
  }

  const selectHandler: ChangeEventHandler<HTMLSelectElement> = (e) => {
    const { target } = e;
    const { value: environmentValue } = target;

    if (environmentValue === editEnvironmentValue) {
      setState(true);
    } else {
      setCurrent(
        environments.find((env) => environmentValue === env.coordd_address) ||
          null
      );
    }
  };

  const closeHandler = () => {
    setState(false);
    refetch();
  };

  const enableHandler = () => {
    setState(true);
  };

  return (
    <>
      {environments.length < 1 ? (
        <>
          <Button size="sm" onClick={enableHandler} border="1px">
            + Enable Regions
          </Button>
        </>
      ) : (
        <Select
          aria-label="Environment"
          name="environment-select"
          value={current?.coordd_address || ""}
          onChange={selectHandler}
          size="sm"
        >
          {environments.map((e) => (
            <option
              key={e.coordd_address}
              value={e.coordd_address}
              data-testid="environment-option"
            >
              {e.provider}/{e.region}
            </option>
          ))}
          <option
            key="edit_regions"
            value={editEnvironmentValue}
            data-testid="edit-option"
          >
            + Edit Regions
          </option>
        </Select>
      )}
      <EnvironmentListModal isOpen={state} onClose={closeHandler} />
    </>
  );
};

export default EnvironmentSelectField;
