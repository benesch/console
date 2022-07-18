import { AddIcon } from "@chakra-ui/icons";
import {
  Button,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import React from "react";
import { useRecoilState } from "recoil";

import { hasEnvironmentWritePermission, useAuth } from "../../api/auth";
import { SupportedCloudRegion } from "../../api/backend";
import useEnvironmentState from "../../api/useEnvironmentState";
import { hasCreatedEnvironment } from "../../recoil/environments";
import DestroyEnvironmentModal from "./DestroyEnvironmentModal";

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
``;
interface RegionEnvironmentRowProps {
  region: SupportedCloudRegion;
}

const RegionEnvironmentRow = (props: RegionEnvironmentRowProps) => {
  /**
   * States
   */
  const { user, fetchAuthed } = useAuth();
  const canWriteEnvironments = hasEnvironmentWritePermission(user);
  const {
    environment,
    status: environmentStatus,
    refetch,
  } = useEnvironmentState(props.region.environmentControllerUrl);
  const [isCreatingEnv, setIsCreatingEnv] = React.useState(false);
  const [_, setHasCreatedEnv] = useRecoilState(hasCreatedEnvironment);
  const toast = useToast();
  const { region: r } = props;

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
      url = <Spinner size="sm" />;
      break;

    default:
      break;
  }

  const handleCreate = React.useCallback(async () => {
    try {
      setIsCreatingEnv(true);
      await fetchAuthed(`${r.environmentControllerUrl}/api/environment`, {
        body: JSON.stringify({}),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      setIsCreatingEnv(false);
      setHasCreatedEnv(true);
      await refetch();
      toast({
        title: "Region enabled.",
        status: "success",
      });
    } catch (e: any) {
      console.log(e);
      setIsCreatingEnv(false);
      if (e.status === 400) {
        toast({
          title: "Failed to enable region.",
          status: "error",
        });
      }
    }
  }, [r.environmentControllerUrl]);

  return (
    <Tr>
      <Td>
        {r.provider}/{r.region}
      </Td>
      <Td>{url}</Td>
      <Td>
        {!environment && (
          <Button
            leftIcon={isCreatingEnv ? <Spinner size="sm" /> : <AddIcon />}
            colorScheme="purple"
            size="sm"
            float="right"
            onClick={handleCreate}
            disabled={!canWriteEnvironments || isCreatingEnv}
            title={
              canWriteEnvironments ? "" : "Only admins can enable new regions."
            }
          >
            {isCreatingEnv ? "Enabling region..." : "Enable region"}
          </Button>
        )}
        {environment && (
          <DestroyEnvironmentModal
            region={r}
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
