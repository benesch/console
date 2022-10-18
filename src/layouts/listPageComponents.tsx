/**
 * @module
 * List view of deployments or other materialize primitives.
 */

import {
  Alert,
  AlertIcon,
  Box,
  Heading,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import React from "react";

import { CodeBlock, CopyableBox } from "../components/copyableComponents";
import TextLink from "../components/TextLink";
import Slash from "../svg/Slash";
import colors, { semanticColors } from "../theme/colors";
import { NAV_LOGO_HEIGHT } from "./NavBar";

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

type EmptyListProps = {
  title: string;
  heading: string;
  icon?: React.ReactNode;
  codeBlockTitle: string;
  codeBlockContents?: string;
  codeBlockChildren?: React.ReactNode;
};

export const EmptyList = ({
  title,
  heading,
  icon,
  codeBlockTitle,
  codeBlockContents,
  codeBlockChildren,
}: EmptyListProps) => {
  const iconColor = useColorModeValue("gray.200", "gray.300");
  const slashColor = useColorModeValue("gray.900", "white");
  const bgColor = useColorModeValue(
    semanticColors.bg.light,
    colors.purple[900]
  );

  return (
    <VStack
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      flex={1}
      spacing={8}
      mt={`-${NAV_LOGO_HEIGHT}`} // To truly center the contents in the container despite the header
      h="full"
    >
      <VStack
        alignItems="center"
        justifyContent="center"
        spacing={4}
        maxW="252px"
        textAlign="center"
      >
        <Box stroke={iconColor} h="40px" w="40px" position="relative">
          <Box
            p="9px"
            position="absolute"
            top="2px"
            left="center"
            h="40px"
            w="40px"
          >
            <Slash fillColor={slashColor} bgColor={bgColor} />
          </Box>
          {icon}
        </Box>
        <Heading fontSize="md">{`There are no available ${title}`}</Heading>
        <Heading fontSize="md" fontWeight={400}>
          {heading}
        </Heading>
      </VStack>
      {codeBlockContents && (
        <VStack
          alignItems="center"
          justifyContent="center"
          spacing={2}
          w="360px"
        >
          <CodeBlock
            title={codeBlockTitle}
            contents={codeBlockContents}
            lineNumbers
            w="full"
          >
            {codeBlockChildren}
          </CodeBlock>
          <Text fontSize="xs" textAlign="left" width="full">
            Having trouble?{" "}
            <TextLink href="//materialize.com/docs/sql/create-cluster/">
              View the documentation.
            </TextLink>
          </Text>
        </VStack>
      )}
    </VStack>
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
