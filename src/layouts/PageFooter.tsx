/**
 * @module
 * Components and utils display at the bottom of layouts
 */

import { HStack } from "@chakra-ui/layout";
import { Text, useTheme } from "@chakra-ui/react";
import React from "react";

import TextLink from "~/components/TextLink";
import Org from "~/layouts/Org";
import { MaterializeTheme } from "~/theme";
import Version from "~/version/Version";

/**
 * the current year as four digit
 * @returns the current year
 */
export const getCurrentYear = () => new Date().getFullYear();

/** A footer component */
const PageFooter: React.FC<React.PropsWithChildren<unknown>> = () => {
  const { colors } = useTheme<MaterializeTheme>();

  return (
    <HStack
      spacing="4"
      bg={colors.semanticColors.background.primary}
      color={colors.semanticColors.foreground.secondary}
      textAlign="center"
      alignItems="center"
      justifyContent="center"
      py="2"
      fontWeight="400"
      fontSize="sm"
      flexDir={{ base: "column", md: "row" }}
      boxShadow="footer"
      borderTopColor={colors.semanticColors.border.primary}
      borderTopWidth="1px"
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
