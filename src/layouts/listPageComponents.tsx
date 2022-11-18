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
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import React from "react";

import { CopyableBox } from "~/components/copyableComponents";
import TextLink from "~/components/TextLink";
import { NAV_LOGO_HEIGHT } from "~/layouts/NavBar";
import Missing from "~/svg/Missing";
import Slash from "~/svg/Slash";
import colors, { semanticColors } from "~/theme/colors";

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
  const grayText = useColorModeValue(
    semanticColors.grayText.light,
    semanticColors.grayText.dark
  );
  return (
    <VStack spacing={1} alignItems="stretch">
      <Text size="xs" fontWeight="600" color={grayText}>
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
    mt={`-${NAV_LOGO_HEIGHT}`} // To truly center the contents in the container despite the header
    h="full"
  >
    {props.children}
  </VStack>
);

export const EmptyListHeader = (props: BoxProps) => (
  <VStack
    alignItems="center"
    justifyContent="center"
    spacing={4}
    maxW="252px"
    textAlign="center"
  >
    {props.children}
  </VStack>
);

type IconBoxProps = BoxProps & {
  type?: EmptyType;
};

export const IconBox = ({ type, children }: IconBoxProps) => {
  const iconColor = useColorModeValue("gray.200", "gray.300");
  const slashColor = useColorModeValue("gray.900", "white");
  const bgColor = useColorModeValue(
    semanticColors.bg.light,
    colors.purple[900]
  );
  let overlapIcon = <Slash fillColor={slashColor} bgColor={bgColor} />;
  switch (type) {
    case "Missing":
      overlapIcon = <Missing fillColor={slashColor} bgColor={bgColor} />;
      break;
    default:
      overlapIcon = <Slash fillColor={slashColor} bgColor={bgColor} />;
  }
  return (
    <Box stroke={iconColor} h="40px" w="40px" position="relative">
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
  return (
    <>
      <Heading fontSize="md">{title}</Heading>
      <Heading fontSize="md" fontWeight={400}>
        {helpText}
      </Heading>
    </>
  );
};

type SampleCodeBoxWrapperProps = BoxProps & {
  docsUrl?: string;
};

export const SampleCodeBoxWrapper = (props: SampleCodeBoxWrapperProps) => {
  return (
    <VStack alignItems="center" justifyContent="center" spacing={2} w="360px">
      {props.children}
      <Text fontSize="xs" textAlign="left" width="full">
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
