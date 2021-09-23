/**
 * A link to our jira status page
 * @returns
 */
import { LinkProps } from "@chakra-ui/layout";
import { Link } from "@chakra-ui/react";
import React from "react";

export const SystemStatusLink: React.FC<LinkProps> = (props) => {
  return (
    <Link {...props} href="https://status.materialize.com/" target="_blank">
      System Status
    </Link>
  );
};
