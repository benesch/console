/**
 * @module
 * List view of deployments or other materialize primitives.
 */

import {
  Alert,
  AlertIcon,
  Flex,
  Heading,
  HStack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";

import CloudSvg from "../svg/CloudSvg";
import colors from "../theme/colors";
import { PageHeading } from "./BaseLayout";

type ListPageHeaderContentProps = {
  title: string;
  children?: React.ReactNode;
};

export const ListPageHeaderContent: React.FC<ListPageHeaderContentProps> = ({
  title,
  children,
}) => {
  return (
    <HStack spacing={4} alignItems="center" justifyContent="flex-start">
      <PageHeading>{title}</PageHeading>
      {children}
    </HStack>
  );
};

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
};

export const EmptyList = ({ title }: EmptyListProps) => {
  const borderColor = useColorModeValue(colors.purple[600], colors.purple[400]);

  return (
    <Flex
      border={`1px dashed ${borderColor}`}
      borderRadius="4px"
      height="100%"
      alignItems="center"
      justifyContent="center"
      gap="5"
      flex={1}
      flexFlow="column"
    >
      <CloudSvg />
      <Heading fontWeight="400" fontSize="2xl">
        {`No ${title} yet.`}
      </Heading>
    </Flex>
  );
};
