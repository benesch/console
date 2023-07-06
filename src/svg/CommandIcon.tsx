import { Icon, IconProps } from "@chakra-ui/react";
import React from "react";

const CommandIcon = (props: IconProps) => (
  <Icon
    width="4"
    height="4"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M3 4L7 8L3 12"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 12H13"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

export default CommandIcon;
