/**
 * @module
 * Components and utils display at the bottom of layouts
 */

import { Box, Link } from "@chakra-ui/layout";
import React from "react";

/**
 * the current year as four digit
 * @returns the current year
 */
export const getCurrentYear = () => new Date().getFullYear();

/** A footer component */
export const PageFooter: React.FC = () => {
  return (
    <Box
      bg="white"
      color="gray.500"
      textAlign="right"
      py="3"
      fontWeight="400"
      fontSize="sm"
      boxShadow="footer"
    >
      © {getCurrentYear()} Materialize, Inc.
      <Link
        href="https://materialize.com/privacy-policy"
        target="_blank"
        pl="1.5em"
      >
        Privacy Policy
      </Link>
      <Link
        href="https://materialize.com/terms-and-conditions"
        target="_blank"
        pl="1.5em"
      >
        Terms &amp; Conditions
      </Link>
      <Link
        href="https://status.materialize.com/"
        target="_blank"
        pl="1.5em"
        pr="1.5em"
      >
        System Status
      </Link>
    </Box>
  );
};
