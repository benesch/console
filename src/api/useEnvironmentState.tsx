import { useInterval } from "@chakra-ui/react";
import React from "react";
import { useRecoilState } from "recoil";

import {
  EnvironmentStatus,
  hasCreatedEnvironment,
} from "../recoil/environments";
import getDefaultEnvironment from "../utils/platform";
import { Environment, useEnvironmentsList } from "./environment-controller";
import { useEnvironments } from "./environment-controller-fetch";
import { useSqlOnCoordinator } from "./materialized";

type EnvironmentState = {
  environment?: Environment;
  refetch: () => Promise<any>;
  status: EnvironmentStatus;
};

export const useRegionEnvironmentState = (
  regionControllerUrl: string | undefined
): EnvironmentState => {
  const { environments } = useEnvironments();
  return useEnvironmentState(
    environments?.find((env) => env.regionControllerUrl === regionControllerUrl)
      ?.environmentControllerUrl
  );
};

const useEnvironmentState = (
  environmentControllerUrl: string | undefined
): EnvironmentState => {
  const { data: environments, refetch } = useEnvironmentsList({
    base: environmentControllerUrl,
  });
  const environment = React.useMemo(
    () => getDefaultEnvironment(environments),
    [environments]
  );
  const [_, setHasCreatedEnv] = useRecoilState(hasCreatedEnvironment);
  // It's useful to know that the useSql() has executed once
  // and results from query can be used.
  const [firstQuery, setFirstQuery] = React.useState<boolean>(true);

  // Simple SQL state used as a way to monitor instance status
  const {
    data,
    loading: loadingQuery,
    refetch: refetchSql,
  } = useSqlOnCoordinator("SELECT 1", environment);
  const negativeHealth = !data || data.rows.length === 0;

  const intervalCallback = React.useCallback(() => {
    refetch();
    if (environment) {
      refetchSql();
    }
  }, [refetch, refetchSql]);

  /**
   * Hydrate state
   */
  useInterval(intervalCallback, 5000);

  /**
   * Know when the first query to the environment is ran
   */
  React.useEffect(() => {
    if (firstQuery && environment && !loadingQuery) {
      setFirstQuery(false);
    }
  }, [loadingQuery]);

  /*
   * Set flag so we don't show the welcome modal
   * if the user already has had an env
   */
  React.useEffect(() => {
    if (environment) setHasCreatedEnv(true);
  }, [environment]);

  if (environment && firstQuery) {
    return {
      environment,
      status: "Loading",
      refetch,
    };
  } else if (environment) {
    if (negativeHealth) {
      return {
        environment,
        status: "Starting",
        refetch,
      };
    } else {
      return {
        environment,
        status: "Enabled",
        refetch,
      };
    }
  }

  return {
    status: "Not enabled",
    refetch,
  };
};

export default useEnvironmentState;
