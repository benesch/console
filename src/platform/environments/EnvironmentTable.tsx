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

import { isAdmin, useAuth } from "../../api/auth";
import { SupportedCloudRegion } from "../../api/backend";
import useIsCurrentEnvironmentState from "../home/useEnvironmentState";
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
  const {
    environment,
    state: environmentState,
    refetch,
  } = useIsCurrentEnvironmentState(props.region.environmentControllerUrl);

  /**
   * Vars
   */
  let url = <Text color="gray">Not enabled</Text>;

  switch (environmentState) {
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
