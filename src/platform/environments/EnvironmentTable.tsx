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
} from "@chakra-ui/react";
import React from "react";

import { hasEnvironmentWritePermission, useAuth } from "../../api/auth";
import { SupportedCloudRegion } from "../../api/backend";
import useEnvironmentState from "../../api/useEnvironmentState";
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
            <Th />
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
  const canWriteEnvironments = hasEnvironmentWritePermission(user);
  const {
    environment,
    status: environmentStatus,
    refetch,
  } = useEnvironmentState(props.region.environmentControllerUrl);

  /**
   * Vars
   */
  let url = <Text color="gray">Not enabled</Text>;

  switch (environmentStatus) {
    case "Enabled":
      url = <Text color="gray">Enabled</Text>;
      break;

    case "Starting":
      url = <Text color="gray">Starting</Text>;
      break;

    case "Loading":
      url = <Spinner />;
      break;

    default:
      break;
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
            canWrite={canWriteEnvironments}
          />
        )}
        {environment && (
          <DestroyEnvironmentModal
            region={props.region}
            size="sm"
            float="right"
            canWrite={canWriteEnvironments}
          />
        )}
      </Td>
    </Tr>
  );
};

export default EnvironmentTable;
