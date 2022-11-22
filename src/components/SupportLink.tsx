/**
 * @module
 * Call to action (CTA) components.
 */

import { LinkProps } from "@chakra-ui/react";
import React from "react";

import TextLink from "~/components/TextLink";

export const SUPPORT_EMAIL = "support@materialize.com";
export const SUPPORT_HREF = `mailto:${SUPPORT_EMAIL}`;

const SupportLink = (props: LinkProps) => {
  return <TextLink href={SUPPORT_HREF} {...props} />;
};

export default SupportLink;
