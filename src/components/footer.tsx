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
      textAlign="center"
      py="3"
      fontWeight="400"
      fontSize="sm"
      boxShadow="footer"
      display="relative"
    >
      © {getCurrentYear()} Materialize
      <Link
        href="https://status.materialize.com/"
        target="_blank"
        position="absolute"
        right={4}
      >
        System Status
      </Link>
    </Box>
  );
};
