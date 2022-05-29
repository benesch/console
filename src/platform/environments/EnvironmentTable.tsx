import {
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useInterval,
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { isAdmin, useAuth } from "../../api/auth";
import { SupportedCloudRegion } from "../../api/backend";
import { useEnvironmentsList } from "../../api/environment-controller";
import { useSqlOnCoordinator } from "../../api/materialized";
import getDefaultEnvironment from "../../utils/platform";
import DestroyEnvironmentModal from "./DestroyEnvironmentModal";
import EnableEnvironmentModal from "./EnableEnvironmentModal";

interface EnvironmentTableProps {
  regions: SupportedCloudRegion[];
}

const EnvironmentTable = (props: EnvironmentTableProps) => {
  return (
    <TableContainer>
      <Table data-testid="cluster-table" borderRadius="xl">
        <Thead>
          <Tr>
            <Th>Region</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {props.regions.map((r) => (
            <RegionEnvironmentRow key={r.environmentControllerUrl} region={r} />
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

interface RegionEnvironmentRowProps {
  region: SupportedCloudRegion;
}

const RegionEnvironmentRow = (props: RegionEnvironmentRowProps) => {
  /**
   * States
   */
  const { user } = useAuth();
  const admin = isAdmin(user);
  const { data: environments, refetch } = useEnvironmentsList({
    base: props.region.environmentControllerUrl,
  });
  const environment = useMemo(
    () => getDefaultEnvironment(environments),
    [environments]
  );
  // It's useful to know that the useSql() has executed once
  // and results from query can be used.
  const [firstQuery, setFirstQuery] = useState<boolean>(true);

  // Simple SQL state used as a way to monitor instance status
  const {
    data,
    loading: loadingQuery,
    refetch: refetchSql,
  } = useSqlOnCoordinator("SELECT 1", environment);
  const negativeHealth = !data || data.rows.length === 0;

  const intervalCallback = useCallback(() => {
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
  useEffect(() => {
    if (firstQuery && environment && !loadingQuery) {
      setFirstQuery(false);
    }
  }, [loadingQuery]);

  /**
   * Vars
   */
  let url = <Text color="gray">Not enabled</Text>;

  if (environment && firstQuery) {
    url = <Spinner />;
  } else if (environment) {
    if (negativeHealth) {
      url = <Text color="gray">Starting</Text>;
    } else {
      url = <Text color="gray">Enabled</Text>;
    }
  }

  return (
    <Tr>
      <Td>
        {props.region.provider}/{props.region.region}
      </Td>
      <Td>{url}</Td>
      <Td>
        {!environment && (
          <EnableEnvironmentModal
            refetch={refetch}
            region={props.region}
            size="sm"
            float="right"
            isAdmin={admin}
          />
        )}
        {environment && (
          <DestroyEnvironmentModal
            region={props.region}
            size="sm"
            float="right"
            isAdmin={admin}
          />
        )}
      </Td>
    </Tr>
  );
};

export default EnvironmentTable;
