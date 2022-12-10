import { Link, LinkProps, useTheme } from "@chakra-ui/react";
import React from "react";

const TextLink = (props: LinkProps) => {
  const { colors } = useTheme();

  return (
    <Link
      color={colors.semanticColors.accent.purple}
      textDecoration="underline"
      {...props}
    />
  );
};

export default TextLink;
