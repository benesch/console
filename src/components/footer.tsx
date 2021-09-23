/**
 * @module
 * Components and utils display at the bottom of layouts
 */

import { Box } from "@chakra-ui/layout";
import React from "react";

import { SystemStatusLink } from "../systemStatus/SystemStatusLink";

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
      <SystemStatusLink position="absolute" right={4} />
    </Box>
  );
};
