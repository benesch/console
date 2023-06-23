import { Link, LinkProps, useTheme } from "@chakra-ui/react";
import React from "react";

import { MaterializeTheme } from "~/theme";

const TextLink = (props: LinkProps) => {
  const { colors } = useTheme<MaterializeTheme>();

  return (
    <Link
      color={colors.accent.brightPurple}
      textDecoration="none"
      _hover={{ textDecoration: "underline" }}
      {...props}
    />
  );
};

export default TextLink;
