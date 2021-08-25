/**
 * @module
 * A reusable "card" component.
 */

import { Box, Heading, HStack, Text } from "@chakra-ui/react";
import React from "react";

export interface CardProps {
  children?: React.ReactNode;
}

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
export function Card(props: CardProps) {
  return (
    <Box bg="white" shadow="base" width="100%">
      {props.children}
    </Box>
  );
}

export interface CardHeaderProps {
  children: React.ReactNode;
}

/** A header for a `Card`. */
export function CardHeader(props: CardHeaderProps) {
  return (
    <Heading
      fontSize="lg"
      fontWeight="600"
      p="4"
      borderBottomWidth="1px"
      borderBottomColor="gray.100"
    >
      {props.children}
    </Heading>
  );
}

export interface CardContentProps {
  children?: React.ReactNode;
}

/** The container of the body content for a `Card`. */
export function CardContent(props: CardContentProps) {
  return <Box p="4">{props.children}</Box>;
}

export interface CardFooterProps {
  children?: React.ReactNode;
}

/** A footer for a `Card`. */
export function CardFooter(props: CardFooterProps) {
  return (
    <HStack display="flex" borderTop="1px" borderTopColor="gray.100" p="4">
      {props.children}
    </HStack>
  );
}

export interface CardFieldProps {
  name: string;
  children: React.ReactNode;
}

/** A name–value pair for display in a `Card`. */
export function CardField(props: CardFieldProps) {
  return (
    <Box>
      <Text fontSize="sm" color="grey">
        {props.name}
      </Text>
      {props.children}
    </Box>
  );
}
