/**
 * @module
 * List view of deployments or other materialize primitives.
 */

import {
  Alert,
  AlertIcon,
  Box,
  BoxProps,
  Heading,
  Text,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import React from "react";

import { CopyableBox } from "~/components/copyableComponents";
import TextLink from "~/components/TextLink";
import Missing from "~/svg/Missing";
import Slash from "~/svg/Slash";
import { MaterializeTheme } from "~/theme";

type GenericListProps = {
  message: string;
};

export const ListFetchError = ({ message, ...props }: GenericListProps) => {
  return (
    <Alert status="warning" p={1} px={2} {...props}>
      <AlertIcon />
      <Text>{message}</Text>
    </Alert>
  );
};

export type SQLSuggestion = {
  title: string;
  string: string;
};

export const SQLSuggestionBox = ({ title, string }: SQLSuggestion) => {
  const { colors } = useTheme<MaterializeTheme>();

  return (
    <VStack spacing={1} alignItems="stretch">
      <Text
        size="xs"
        fontWeight="600"
        color={colors.semanticColors.foreground.secondary}
      >
        {title}
      </Text>
      <CopyableBox contents={string}>{string}</CopyableBox>
    </VStack>
  );
};

/*
 * Composable components for the empty list view
 */

type EmptyType = "Empty" | "Missing" | "Error";

export const EmptyListWrapper = (props: BoxProps) => (
  <VStack
    alignItems="center"
    justifyContent="center"
    textAlign="center"
    flex={1}
    spacing={8}
    h="100%"
    w="100%"
  >
    {props.children}
  </VStack>
);

export const EmptyListHeader = (props: BoxProps) => (
  <VStack
    alignItems="center"
    justifyContent="center"
    spacing={6}
    maxW="460px"
    textAlign="center"
  >
    {props.children}
  </VStack>
);

type IconBoxProps = BoxProps & {
  type?: EmptyType;
};

export const IconBox = ({ type, children }: IconBoxProps) => {
  const { colors } = useTheme<MaterializeTheme>();

  let overlapIcon = (
    <Slash
      fillColor={colors.semanticColors.foreground.primary}
      bgColor={colors.semanticColors.background.primary}
    />
  );
  switch (type) {
    case "Missing":
      overlapIcon = (
        <Missing
          fillColor={colors.semanticColors.foreground.primary}
          bgColor={colors.semanticColors.background.primary}
        />
      );
      break;
    default:
      overlapIcon = (
        <Slash
          fillColor={colors.semanticColors.foreground.primary}
          bgColor={colors.semanticColors.background.primary}
        />
      );
  }
  return (
    <Box
      stroke={colors.semanticColors.border.primary}
      h="40px"
      w="40px"
      position="relative"
    >
      <Box
        p="8px"
        position="absolute"
        top="2px"
        left="center"
        h="40px"
        w="40px"
      >
        {overlapIcon}
      </Box>
      {children}
    </Box>
  );
};

type EmptyListHeaderContentsProps = {
  title: string;
  helpText: string;
};

export const EmptyListHeaderContents = ({
  title,
  helpText,
}: EmptyListHeaderContentsProps) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  return (
    <VStack spacing={2}>
      <Heading
        fontSize="md"
        fontWeight={500}
        color={semanticColors.foreground.primary}
      >
        {title}
      </Heading>
      <Heading
        fontSize="sm"
        lineHeight="20px"
        fontWeight={400}
        color={semanticColors.foreground.secondary}
        mt={2}
      >
        {helpText}
      </Heading>
    </VStack>
  );
};

type SampleCodeBoxWrapperProps = BoxProps & {
  docsUrl?: string;
};

export const SampleCodeBoxWrapper = (props: SampleCodeBoxWrapperProps) => {
  return (
    <VStack
      alignItems="center"
      justifyContent="center"
      spacing={4}
      width="460px"
    >
      {props.children}
      <Text fontSize="sm" textAlign="left" width="full">
        Having trouble?{" "}
        <TextLink
          href={props.docsUrl || "//materialize.com/docs/"}
          target="_blank"
        >
          View the documentation.
        </TextLink>
      </Text>
    </VStack>
  );
};
