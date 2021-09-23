/**
 * @module
 * Components and utils display at the bottom of layouts
 */

import { Box, LinkProps } from "@chakra-ui/layout";
import { Link } from "@chakra-ui/react";
import React from "react";

/**
 * the current year as four digit
 * @returns the current year
 */
export const getCurrentYear = () => new Date().getFullYear();

/**
 * A link to our jira status page
 * @returns
 */

export const StatusPageLink: React.FC<LinkProps> = (props) => {
  return (
    <Link {...props} href="https://status.materialize.com/" target="_blank">
      System Status
    </Link>
  );
};

/** A footer component */
export const PageFooter: React.FC = () => {
  return (
    <Box
      bg="white"
      color="gray.500"
      textAlign="center"
      py="3"
      fontWeight="400"
      fontSize="sm"
      boxShadow="footer"
      display="relative"
    >
      © {getCurrentYear()} Materialize
      <StatusPageLink position="absolute" right={4} />
    </Box>
  );
};
