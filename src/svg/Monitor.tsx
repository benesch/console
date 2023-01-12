import { useTheme } from "@chakra-ui/react";
import React from "react";

import { MaterializeTheme } from "~/theme";

const MonitorIcon = () => {
  const { colors } = useTheme<MaterializeTheme>();

  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_185_547)">
        <rect
          x="1"
          y="2"
          width="14"
          height="10"
          rx="2"
          stroke={colors.semanticColors.foreground.secondary}
        />
        <path
          d="M8 12V14"
          stroke={colors.semanticColors.foreground.secondary}
          strokeLinecap="round"
        />
        <path
          d="M10 14H6"
          stroke={colors.semanticColors.foreground.secondary}
          strokeLinecap="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_185_547">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default MonitorIcon;
