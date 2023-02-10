/**
 * @module
 * Call to action (CTA) components.
 */

import { LinkProps } from "@chakra-ui/react";
import React from "react";

import TextLink from "~/components/TextLink";

export const SUPPORT_HREF = `https://support.materialize.com/`;

const SupportLink = (props: LinkProps) => {
  return (
    <TextLink href={SUPPORT_HREF} target="_blank" rel="noopener" {...props} />
  );
};

export default SupportLink;
