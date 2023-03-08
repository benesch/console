import { Box, HStack, VStack } from "@chakra-ui/react";
import React from "react";

import config from "~/config";
import CreateEnvironmentButton from "~/platform/tutorial/CreateEnvironmentButton";
import { CreateRegion } from "~/platform/tutorial/useCreateEnvironment";

interface Props {
  createRegion: CreateRegion;
  creatingRegionId?: string;
  tenantIsBlocked?: boolean;
}
const EnvironmentList = ({
  creatingRegionId,
  createRegion,
  tenantIsBlocked,
}: Props) => {
  return (
    <VStack spacing={4} data-test-id="regions-list">
      {Array.from(config.cloudRegions.keys()).map((r) => (
        <RegionEnvironmentRow
          key={r}
          regionId={r}
          createRegion={createRegion}
          creatingRegionId={creatingRegionId}
          tenantIsBlocked={tenantIsBlocked}
        />
      ))}
    </VStack>
  );
};

interface RegionEnvironmentRowProps {
  regionId: string;
  createRegion: CreateRegion;
  creatingRegionId?: string;
  tenantIsBlocked?: boolean;
}

const RegionEnvironmentRow = (props: RegionEnvironmentRowProps) => {
  return (
    <HStack
      justifyContent="space-between"
      width="100%"
      minHeight="32px"
      className="regions-list-item"
    >
      <Box>{props.regionId}</Box>
      <Box>
        <CreateEnvironmentButton
          regionId={props.regionId}
          createRegion={props.createRegion}
          creatingRegionId={props.creatingRegionId}
          tenantIsBlocked={props.tenantIsBlocked}
        />
      </Box>
    </HStack>
  );
};

export default EnvironmentList;
