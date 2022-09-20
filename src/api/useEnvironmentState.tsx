import { useInterval } from "@chakra-ui/react";
import React from "react";
import { useRecoilState } from "recoil";

import {
  EnvironmentStatus,
  hasCreatedEnvironment,
} from "../recoil/environments";
import getDefaultEnvironment from "../utils/platform";
import { Environment, useEnvironmentsList } from "./environment-controller";
import { Results, useSqlOnCoordinator } from "./materialized";

type EnvironmentState = {
  environment?: Environment;
  refetch: () => Promise<any>;
  status: EnvironmentStatus;
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
  const [hasLoaded, setHasLoaded] = React.useState<boolean>(false);

  // Simple SQL state used as a way to monitor instance status
  const {
    data,
    loading: loadingQuery,
    refetch: refetchSql,
  } = useSqlOnCoordinator("SELECT 1", environment);

  const status = getStatusFromSQLResponse(data, environment, hasLoaded);

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
    if (!hasLoaded && environment && !loadingQuery) {
      setHasLoaded(true);
    }
  }, [loadingQuery]);

  /*
   * Set flag so we don't show the welcome modal
   * if the user already has had an env
   */
  React.useEffect(() => {
    if (environment) setHasCreatedEnv(true);
  }, [environment]);

  if (environment) {
    return {
      environment,
      status,
      refetch,
    };
  }
  return {
    status,
    refetch,
  };
};

export const getStatusFromSQLResponse = (
  data?: Results | null,
  env?: Environment | null,
  hasLoadedOnce?: boolean
): EnvironmentStatus => {
  const negativeHealth = !data || data.rows.length === 0;
  if (env && !hasLoadedOnce) {
    return "Loading";
  } else if (env) {
    if (negativeHealth) {
      return "Starting";
    } else {
      return "Enabled";
    }
  }

  return "Not enabled";
};

export default useEnvironmentState;
