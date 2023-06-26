import { Icon, IconProps } from "@chakra-ui/react";
import React from "react";

const OverflowMenuIcon = (props: IconProps) => {
  return (
    <Icon
      width="4"
      height="4"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color="semanticColors.foreground.tertiary"
      {...props}
    >
      <circle cx="8" cy="4" r="1" fill="currentColor" />
      <circle cx="8" cy="8" r="1" fill="currentColor" />
      <circle cx="8" cy="12" r="1" fill="currentColor" />
    </Icon>
  );
};

export default OverflowMenuIcon;
