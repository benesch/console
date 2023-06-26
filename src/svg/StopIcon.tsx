import { Icon, IconProps } from "@chakra-ui/react";
import React from "react";

const StopIcon = (props: IconProps) => {
  return (
    <Icon
      width="4"
      height="4"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x="3" y="3" width="10" height="10" rx="2" fill="currentColor" />
    </Icon>
  );
};

export default StopIcon;
