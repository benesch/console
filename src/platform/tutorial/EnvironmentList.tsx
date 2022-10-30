import { Box, HStack, VStack } from "@chakra-ui/react";
import React from "react";

import config from "../../config";
import CreateEnvironmentButton from "./CreateEnvironmentButton";

const EnvironmentList = () => {
  const [isCreatingEnv, setIsCreatingEnv] = React.useState(false);
  return (
    <VStack spacing={4} data-test-id="regions-list">
      {Array.from(config.cloudRegions.keys()).map((r) => (
        <RegionEnvironmentRow
          key={r}
          regionId={r}
          setIsCreatingEnv={setIsCreatingEnv}
          isCreatingEnv={isCreatingEnv}
        />
      ))}
    </VStack>
  );
};

interface RegionEnvironmentRowProps {
  regionId: string;
  isCreatingEnv: boolean;
  setIsCreatingEnv: (flag: boolean) => void;
}

const RegionEnvironmentRow = (props: RegionEnvironmentRowProps) => {
  const { regionId } = props;

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
      <Box>{regionId}</Box>
      <Box>
        <CreateEnvironmentButton
          regionId={props.regionId}
          isCreatingEnv={props.isCreatingEnv}
          handleEnvCreate={handleEnvCreate}
        />
      </Box>
    </HStack>
  );
};

export default EnvironmentList;
