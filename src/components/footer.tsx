/**
 * @module
 * Components and utils display at the bottom of layouts
 */

import { Box, Link } from "@chakra-ui/layout";
import { useColorModeValue } from "@chakra-ui/react";
import React from "react";

/**
 * the current year as four digit
 * @returns the current year
 */
export const getCurrentYear = () => new Date().getFullYear();

/** A footer component */
export const PageFooter: React.FC = () => {
  const footerBg = useColorModeValue("white", "purple.900");
  const color = useColorModeValue("gray.500", "gray.200");
  return (
    <Box
      bg={footerBg}
      color={color}
      textAlign="center"
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
