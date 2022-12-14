/**
 * @module
 * A reusable "card" component.
 */

import { BoxProps, Flex, HeadingProps } from "@chakra-ui/layout";
import { Box, Heading, HStack, Text, useTheme } from "@chakra-ui/react";
import { Tab, TabList, TabListProps, TabProps, Tabs } from "@chakra-ui/tabs";
import React from "react";

export const CARD_PADDING = 4;

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
export const Card = React.forwardRef(
  (props: BoxProps, ref: React.LegacyRef<HTMLDivElement> | undefined) => {
    const { colors, shadows } = useTheme();

    return (
      <Box
        ref={ref}
        bg={colors.semanticColors.background.primary}
        shadow={shadows.level2}
        border="1px solid"
        borderColor={colors.semanticColors.border.primary}
        width="100%"
        borderRadius="xl"
        {...props}
      >
        {props.children}
      </Box>
    );
  }
);

export interface CardTitleProps extends HeadingProps {
  children: React.ReactNode;
}

/* A title for a `Card`. Used standalone in `CardTabsHeaders.` */
export const CardTitle = (props: CardTitleProps) => {
  return <Heading fontSize="lg" fontWeight="600" p={CARD_PADDING} {...props} />;
};

/** A header for a `Card`. */
export const CardHeader = (props: CardTitleProps) => {
  const { colors } = useTheme();
  return (
    <CardTitle
      borderBottomWidth="1px"
      borderBottomColor={colors.semanticColors.border.primary}
      {...props}
    />
  );
};

export const CardTabs = Tabs;

export const CardTab: React.FC<React.PropsWithChildren<TabProps>> = (props) => {
  return <Tab {...props} />;
};

/** a drop in replacement to the TabList component that can be used in a card header container */
export const CardTabsHeaders: React.FC<
  React.PropsWithChildren<TabListProps>
> = (props) => {
  return (
    <TabList as={Flex} display="flex" alignItems="center" {...props}></TabList>
  );
};

/** The container of the body content for a `Card`. */
export const CardContent = ({ children, ...props }: BoxProps) => {
  return (
    <Box p={CARD_PADDING} {...props}>
      {children}
    </Box>
  );
};

export interface CardFooterProps {
  children?: React.ReactNode;
}

/** A footer for a `Card`. */
export const CardFooter = (props: CardFooterProps) => {
  const { colors } = useTheme();
  return (
    <HStack
      display="flex"
      borderTop="1px"
      borderTopColor={colors.semanticColors.border.primary}
      p={CARD_PADDING}
    >
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
