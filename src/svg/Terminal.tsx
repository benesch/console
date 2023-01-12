import { useTheme } from "@chakra-ui/react";
import React from "react";

import { MaterializeTheme } from "~/theme";

const TerminalIcon = () => {
  const { colors } = useTheme<MaterializeTheme>();
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="1"
        y="2"
        width="14"
        height="12"
        rx="2"
        stroke={colors.semanticColors.foreground.secondary}
      />
      <path
        d="M5 6L7 8L5 10"
        stroke={colors.semanticColors.foreground.secondary}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 10H11"
        stroke={colors.semanticColors.foreground.secondary}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default TerminalIcon;
