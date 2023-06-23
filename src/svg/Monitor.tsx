import { Icon, IconProps, useTheme } from "@chakra-ui/react";
import React from "react";

import { MaterializeTheme } from "~/theme";

const MonitorIcon = (props: IconProps) => {
  const { colors } = useTheme<MaterializeTheme>();

  return (
    <Icon
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g>
        <rect
          x="1"
          y="2"
          width="14"
          height="10"
          rx="2"
          stroke={colors.foreground.secondary}
        />
        <path
          d="M8 12V14"
          stroke={colors.foreground.secondary}
          strokeLinecap="round"
        />
        <path
          d="M10 14H6"
          stroke={colors.foreground.secondary}
          strokeLinecap="round"
        />
      </g>
    </Icon>
  );
};

export default MonitorIcon;
