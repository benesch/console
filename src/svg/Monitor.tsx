import { useColorModeValue } from "@chakra-ui/react";
import React from "react";

import colors from "~/theme/colors";

const MonitorIcon = () => {
  const strokeColor = useColorModeValue(colors.gray[500], colors.gray[300]);
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_185_547)">
        <rect x="1" y="2" width="14" height="10" rx="2" stroke={strokeColor} />
        <path d="M8 12V14" stroke={strokeColor} strokeLinecap="round" />
        <path d="M10 14H6" stroke={strokeColor} strokeLinecap="round" />
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
