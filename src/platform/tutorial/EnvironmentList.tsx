import { Box, HStack, VStack } from "@chakra-ui/react";
import React from "react";

import { SupportedCloudRegion } from "../../api/backend";
import useEnvironmentState from "../../api/useEnvironmentState";
import CreateEnvironmentButton from "./CreateEnvironmentButton";

interface EnvironmentTableProps {
  regions: SupportedCloudRegion[];
}

const EnvironmentList = (props: EnvironmentTableProps) => {
  const [isCreatingEnv, setIsCreatingEnv] = React.useState(false);

  return (
    <VStack spacing={4} data-test-id="regions-list">
      {props.regions.map((r) => (
        <RegionEnvironmentRow
          key={r.regionControllerUrl}
          region={r}
          setIsCreatingEnv={setIsCreatingEnv}
          isCreatingEnv={isCreatingEnv}
        />
      ))}
    </VStack>
  );
};

interface RegionEnvironmentRowProps {
  region: SupportedCloudRegion;
  isCreatingEnv: boolean;
  setIsCreatingEnv: (flag: boolean) => void;
}

const RegionEnvironmentRow = (props: RegionEnvironmentRowProps) => {
  const { environment, refetch } = useEnvironmentState(
    props.region.regionControllerUrl
  );
  const { region: r } = props;

  const handleEnvCreate = React.useCallback(
    async (isCreating: boolean) => {
      props.setIsCreatingEnv(isCreating);
      await refetch();
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
        {!environment && (
          <CreateEnvironmentButton
            {...props}
            handleEnvCreate={handleEnvCreate}
          />
        )}
      </Box>
    </HStack>
  );
};

export default EnvironmentList;
