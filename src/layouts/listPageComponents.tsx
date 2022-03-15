/**
 * @module
 * List view of deployments or other materialize primitives.
 */

import {
  Alert,
  AlertIcon,
  Heading,
  HStack,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import React from "react";

import CloudSvg from "../svg/CloudSvg";
import colors from "../theme/colors";
import { PageHeading } from "./BaseLayout";
import EnvironmentSelectField from "./EnvironmentSelect";

type ListPageHeaderContentProps = {
  title: string;
};

export const ListPageHeaderContent: React.FC<ListPageHeaderContentProps> = ({
  title,
}) => {
  return (
    <HStack spacing={4} alignItems="center" justifyContent="flex-start">
      <PageHeading>{title}</PageHeading>
      <EnvironmentSelectField />
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
    <VStack
      border={`1px dashed ${borderColor}`}
      borderRadius="4px"
      minHeight="600px"
      alignItems="center"
      justifyContent="center"
      spacing="5"
    >
      <CloudSvg />
      <Heading fontWeight="400" fontSize="2xl">
        {`No ${title} yet.`}
      </Heading>
    </VStack>
  );
};
