/**
 * @module
 * A reusable "card" component.
 */

import { BoxProps, Flex, HeadingProps } from "@chakra-ui/layout";
import {
  Box,
  Heading,
  HStack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { Tab, TabList, TabListProps, TabProps, Tabs } from "@chakra-ui/tabs";
import React from "react";

import { semanticColors } from "../theme/colors";

/**
 * A "card" UI element with a header, body, and footer.
 *
 * Example usage:
 *
 * ```
 * <Card>
 *   <CardHeader>Card title</CardHeader>
 *   <CardContent>
 *     <VStack spacing="3" align="left">
 *       <CardField name="Property 1">Value 1</CardField>
 *       <CardField name="Property 2">Value 2</CardField>
 *     </VStack>
 *   </CardContent>
 *   <CardFooter>
 *     <Spacer />
 *     <Button>Take some action</Button>
 *   </CardFooter>
 * </Card>
 * ```
 */
export const Card = (props: BoxProps) => {
  const bg = useColorModeValue(
    semanticColors.card.bg.light,
    semanticColors.card.bg.dark
  );
  const borderColor = useColorModeValue(
    semanticColors.card.border.light,
    semanticColors.card.border.dark
  );
  const shadow = useColorModeValue("glowLight", "glowDark");
  return (
    <Box
      bg={bg}
      shadow={shadow}
      border={`1px solid`}
      borderColor={borderColor}
      width="100%"
      borderRadius="xl"
      {...props}
    >
      {props.children}
    </Box>
  );
};

export interface CardTitleProps extends HeadingProps {
  children: React.ReactNode;
}

/* A title for a `Card`. Used standalone in `CardTabsHeaders.` */
export const CardTitle = (props: CardTitleProps) => {
  return <Heading fontSize="lg" fontWeight="600" p="4" {...props} />;
};

/** A header for a `Card`. */
export const CardHeader = (props: CardTitleProps) => {
  const borderColor = useColorModeValue(
    semanticColors.divider.light,
    semanticColors.divider.dark
  );
  return (
    <CardTitle
      borderBottomWidth="1px"
      borderBottomColor={borderColor}
      {...props}
    />
  );
};

export const CardTabs = Tabs;

export const CardTab: React.FC<TabProps> = (props) => {
  return <Tab py={4} {...props} />;
};

/** a drop in replacement to the TabList component that can be used in a card header container */
export const CardTabsHeaders: React.FC<TabListProps> = (props) => {
  return (
    <TabList
      as={Flex}
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      pr="2"
      {...props}
    ></TabList>
  );
};

/** The container of the body content for a `Card`. */
export const CardContent = (props: BoxProps) => {
  return <Box p="4">{props.children}</Box>;
};

export interface CardFooterProps {
  children?: React.ReactNode;
}

/** A footer for a `Card`. */
export const CardFooter = (props: CardFooterProps) => {
  const borderColor = useColorModeValue(
    semanticColors.divider.light,
    semanticColors.divider.dark
  );
  return (
    <HStack display="flex" borderTop="1px" borderTopColor={borderColor} p="4">
      {props.children}
    </HStack>
  );
};

export interface CardFieldProps {
  name: string;
  children: React.ReactNode;
}

/** A name–value pair for display in a `Card`. */
export const CardField = (props: CardFieldProps) => {
  return (
    <Box data-field-name={props.name}>
      <Text fontSize="sm" color="grey">
        {props.name}
      </Text>
      {props.children}
    </Box>
  );
};
