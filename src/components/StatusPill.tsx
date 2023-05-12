import { WarningIcon } from "@chakra-ui/icons";
import { Box, BoxProps, Spinner } from "@chakra-ui/react";
import React from "react";

import { Source } from "~/api/materialize/useSources";

export type StatusPillProps = BoxProps & {
  status: string;
  backgroundColor?: string;
  textColor?: string;
  icon: any;
};

/** Gets the background color of source/sink status pills. */
export const getConnectorBackgroundColor = (status: Source["status"]) => {
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

/** Gets the text color of source/sink status pills. */
export const getConnectorTextColor = (status: Source["status"]) => {
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

/** Gets the icon to display for a source/sink status pill. */
export const getSourceIcon = (status: Source["status"]) => {
  switch (status) {
    case "starting":
      return <Spinner width="12px" height="12px" speed="0.75s" />;
    case "failed":
      return <WarningIcon />;
    default:
      return null;
  }
};

const StatusPill = ({
  status,
  backgroundColor,
  textColor,
  icon,
  ...boxProps
}: StatusPillProps) => {
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
      backgroundColor={backgroundColor}
      color={textColor}
      width="fit-content"
      {...boxProps}
    >
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Box>
  );
};

export default StatusPill;
