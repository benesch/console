/**
 * @module
 * Call to action (CTA) components.
 */

import { Link, LinkProps } from "@chakra-ui/react";
import React from "react";

export const SUPPORT_EMAIL = "support@materialize.com";
export const SUPPORT_HREF = `mailto:${SUPPORT_EMAIL}`;

const SupportLink = (props: LinkProps) => {
  return <Link href={SUPPORT_HREF} textDecoration="underline" {...props} />;
};

export default SupportLink;
