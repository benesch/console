import { useInterval } from "@chakra-ui/react";
import React from "react";

import {
  Environment,
  useEnvironmentsList,
} from "../../api/environment-controller";
import { useSqlOnCoordinator } from "../../api/materialized";
import getDefaultEnvironment from "../../utils/platform";

type EnvironmentState = {
  environment?: Environment;
  refetch: () => Promise<any>;
  state: "Loading" | "Starting" | "Enabled" | "Not enabled";
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

  if (environment && firstQuery) {
    return {
      environment,
      state: "Loading",
      refetch,
    };
  } else if (environment) {
    if (negativeHealth) {
      return {
        environment,
        state: "Starting",
        refetch,
      };
    } else {
      return {
        environment,
        state: "Enabled",
        refetch,
      };
    }
  }

  return {
    state: "Not enabled",
    refetch,
  };
};

export default useEnvironmentState;
