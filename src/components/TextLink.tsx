import { Link, LinkProps, useColorModeValue } from "@chakra-ui/react";
import React from "react";

const TextLink = (props: LinkProps) => {
  const linkColor = useColorModeValue("purple.600", "purple.200");

  return <Link color={linkColor} textDecoration="underline" {...props} />;
};

export default TextLink;
