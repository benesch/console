import { Link, LinkProps, useColorModeValue } from "@chakra-ui/react";
import React from "react";

const TextLink = (props: LinkProps) => {
  const linkColor = useColorModeValue("purple.600", "purple.200");
  const hoverColor = useColorModeValue("purple.50", "purple.800");
  return (
    <Link
      color={linkColor}
      textDecoration="underline"
      sx={{
        ":hover": {
          bg: hoverColor,
        },
      }}
      {...props}
    />
  );
};

export default TextLink;
