import { Box, HStack, VStack } from "@chakra-ui/react";
import React from "react";
import { useRecoilState } from "recoil";

import config from "../../config";
import {
  EnvironmentStatus,
  environmentStatusMap,
  getRegionId,
} from "../../recoil/environments";
import { CloudRegion } from "../../types";
import CreateEnvironmentButton from "./CreateEnvironmentButton";

const EnvironmentList = () => {
  const [isCreatingEnv, setIsCreatingEnv] = React.useState(false);
  const [statusMap] = useRecoilState(environmentStatusMap);
  return (
    <VStack spacing={4} data-test-id="regions-list">
      {config.cloudRegions.map((r) => (
        <RegionEnvironmentRow
          key={r.regionControllerUrl}
          region={r}
          setIsCreatingEnv={setIsCreatingEnv}
          isCreatingEnv={isCreatingEnv}
          status={statusMap[getRegionId(r)]}
        />
      ))}
    </VStack>
  );
};

interface RegionEnvironmentRowProps {
  region: CloudRegion;
  status: EnvironmentStatus;
  isCreatingEnv: boolean;
  setIsCreatingEnv: (flag: boolean) => void;
}

const RegionEnvironmentRow = (props: RegionEnvironmentRowProps) => {
  const { region: r, status } = props;

  const handleEnvCreate = React.useCallback(
    async (isCreating: boolean) => {
      props.setIsCreatingEnv(isCreating);
    },
    [props.setIsCreatingEnv]
  );

  return (
    <HStack
      justifyContent="space-between"
      width="100%"
      minHeight="32px"
      className="regions-list-item"
    >
      <Box>
        {r.provider}/{r.region}
      </Box>
      <Box>
        {status === "Not enabled" && (
          <CreateEnvironmentButton
            region={props.region}
            isCreatingEnv={props.isCreatingEnv}
            handleEnvCreate={handleEnvCreate}
          />
        )}
      </Box>
    </HStack>
  );
};

export default EnvironmentList;
