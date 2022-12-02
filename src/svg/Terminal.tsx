import { useColorModeValue } from "@chakra-ui/react";
import React from "react";

import colors from "~/theme/colors";

const TerminalIcon = () => {
  const color = useColorModeValue(colors.gray[500], colors.gray[300]);
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="2" width="14" height="12" rx="2" stroke={color} />
      <path
        d="M5 6L7 8L5 10"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 10H11"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default TerminalIcon;
