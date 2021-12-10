/**
 * @module
 * Components and utils display at the bottom of layouts
 */

import { HStack, Link } from "@chakra-ui/layout";
import { Text } from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/react";
import React from "react";

import { Version } from "../version/Version";
import ReleaseNoteLink from "./releaseNotes/ReleaseNoteLink";

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
    <HStack
      spacing="4"
      bg={footerBg}
      color={color}
      textAlign="center"
      alignItems={"center"}
      justifyContent={"center"}
      py="3"
      fontWeight="400"
      fontSize="sm"
      boxShadow="footer"
    >
      <Text>© {getCurrentYear()} Materialize, Inc.</Text>
      <Link href="https://materialize.com/privacy-policy" target="_blank">
        Privacy Policy
      </Link>
      <Link href="https://materialize.com/terms-and-conditions" target="_blank">
        Terms &amp; Conditions
      </Link>
      <Link href="https://status.materialize.com/" target="_blank">
        System Status
      </Link>
      <Version />
      <ReleaseNoteLink />
    </HStack>
  );
};
