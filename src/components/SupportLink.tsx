/**
 * @module
 * Call to action (CTA) components.
 */

import { LinkProps, useTheme } from "@chakra-ui/react";
import React from "react";

import TextLink from "~/components/TextLink";
import { MaterializeTheme } from "~/theme";

export const SUPPORT_HREF = `https://support.materialize.com/`;

const SupportLink = (props: LinkProps) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  return (
    <TextLink
      color={semanticColors.foreground.primary}
      href={SUPPORT_HREF}
      {...props}
    />
  );
};

export default SupportLink;
