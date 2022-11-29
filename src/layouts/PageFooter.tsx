/**
 * @module
 * Components and utils display at the bottom of layouts
 */

import { HStack } from "@chakra-ui/layout";
import { Text } from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/react";
import React from "react";

import TextLink from "~/components/TextLink";
import Org from "~/layouts/Org";
import Version from "~/version/Version";

/**
 * the current year as four digit
 * @returns the current year
 */
export const getCurrentYear = () => new Date().getFullYear();

/** A footer component */
const PageFooter: React.FC<React.PropsWithChildren<unknown>> = () => {
  const footerBg = useColorModeValue("white", "gray.900");
  const color = useColorModeValue("gray.500", "gray.200");
  const borderWidth = useColorModeValue("0", "1px");
  const borderColor = useColorModeValue("transparent", "gray.700");
  return (
    <HStack
      spacing="4"
      bg={footerBg}
      color={color}
      textAlign="center"
      alignItems="center"
      justifyContent="center"
      py="2"
      fontWeight="400"
      fontSize="sm"
      flexDir={{ base: "column", md: "row" }}
      boxShadow="footer"
      borderTopColor={borderColor}
      borderTopWidth={borderWidth}
    >
      <Text>© {getCurrentYear()} Materialize, Inc.</Text>
      <TextLink href="https://materialize.com/privacy-policy" target="_blank">
        Privacy Policy
      </TextLink>
      <TextLink
        href="https://materialize.com/terms-and-conditions"
        target="_blank"
      >
        Terms &amp; Conditions
      </TextLink>
      <TextLink href="https://status.materialize.com/" target="_blank">
        System Status
      </TextLink>
      <Version />
      <Org />
    </HStack>
  );
};

export default PageFooter;
