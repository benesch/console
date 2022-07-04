import { AddIcon } from "@chakra-ui/icons";
import {
  Button,
  Code,
  Input,
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
  const { user } = useAuth();
  // NB: this is not security-load-bearing, it selectively shows UI
  // but the actual calls will fail if the user isn't authorized
  const isInternal = user.email.endsWith("@materialize.com");
  return (
    <TableContainer>
      <Table data-testid="cluster-table" borderRadius="xl">
        <Thead>
          <Tr>
            <Th>Region</Th>
            <Th>Status</Th>
            {isInternal && <Th>Image reference</Th>}
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          {props.regions.map((r) => (
            <RegionEnvironmentRow
              key={r.environmentControllerUrl}
              region={r}
              isInternal
            />
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

/// The image SHA that we spin up all new materialize platform
/// components up with by default.  You need to bump this to a new
/// value whenever you wish to try new materialized functions in
/// cloud.
// TODO: Use something like the release tracks we use for materialize cloud deployments.
const IMAGE_TAG = "unstable-45e2acde087c27a661b5e67db587375c0b628fde";

interface RegionEnvironmentRowProps {
  region: SupportedCloudRegion;
  isInternal?: boolean;
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
  const [_, setHasCreatedEnv] = useRecoilState(hasCreatedEnvironment);
  const [imageString, setImageString] = React.useState(
    `materialize/environmentd:${IMAGE_TAG}`
  );
  const toast = useToast();
  const { region: r, isInternal } = props;

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
      await fetchAuthed(`${r.environmentControllerUrl}/api/environment`, {
        body: JSON.stringify({
          coordd_image_ref: imageString,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      setHasCreatedEnv(true);
      await refetch();
      toast({
        title: "Region enabled.",
        status: "success",
      });
    } catch (e: any) {
      console.log(e);
      if (e.status === 400) {
        toast({
          title: "Failed to enable region.",
          status: "error",
        });
      }
    }
  }, [r.environmentControllerUrl, imageString]);

  return (
    <Tr>
      <Td>
        {r.provider}/{r.region}
      </Td>
      <Td>{url}</Td>
      {isInternal && (
        <Td>
          <Input
            name="image"
            size="sm"
            value={imageString}
            onChange={(e) => setImageString(e.target.value)}
            disabled={
              environmentStatus === "Starting" ||
              !canWriteEnvironments ||
              !!environment
            }
          />
        </Td>
      )}
      <Td>
        {!environment && (
          <Button
            leftIcon={<AddIcon />}
            colorScheme="purple"
            size="sm"
            float="right"
            onClick={handleCreate}
            disabled={!canWriteEnvironments}
            title={
              canWriteEnvironments ? "" : "Only admins can enable new regions."
            }
          >
            Enable region
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
