import { WarningIcon } from "@chakra-ui/icons";
import { Box, Spinner } from "@chakra-ui/react";
import React from "react";

import { ConnectorStatus, Source } from "~/api/materialized";

interface StatusPillProps {
  status: ConnectorStatus;
}

const getBackgroundColor = (status: Source["status"]) => {
  switch (status) {
    case "created":
      return "#ECE5FF";
    case "starting":
      return "#ECE6FF";
    case "running":
      return "#DEF7E2";
    case "stalled":
      return "#F5E8CF";
    case "failed":
      return "#F5D4D9";
    case "dropped":
      return "#F7F7F8";
  }
};

const getTextColor = (status: Source["status"]) => {
  switch (status) {
    case "created":
      return "#1C1561";
    case "starting":
      return "#1C1561";
    case "running":
      return "#00471D";
    case "stalled":
      return "#8A5B01";
    case "failed":
      return "#B80F25";
    case "dropped":
      return "#736F7B";
  }
};

const StatusPill = ({ status }: StatusPillProps) => {
  let icon = null;
  if (status === "starting") {
    icon = <Spinner width="12px" height="12px" speed="0.75s" />;
  }
  if (status === "failed") {
    icon = <WarningIcon />;
  }
  return (
    <Box
      display="flex"
      alignItems="center"
      gap="4px"
      borderRadius="40px"
      paddingY="2px"
      paddingX="8px"
      textAlign="center"
      fontSize="xs"
      fontWeight="500"
      backgroundColor={getBackgroundColor(status)}
      color={getTextColor(status)}
      width="fit-content"
    >
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Box>
  );
};

export default StatusPill;
