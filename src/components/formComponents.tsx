import {
  Box,
  CloseButton,
  Flex,
  FormErrorMessage,
  FormLabel,
  Grid,
  Text,
  useTheme,
} from "@chakra-ui/react";
import React from "react";
import { NavLink } from "react-router-dom";

import { MaterializeTheme } from "~/theme";

/**
 * Reusable form components
 *
 * Example usage:
 *
 * ```
 * <FormTopBar title="New Object" backButtonHref="..">
 *   <Button variant="primary"  type="submit">Create</Button>
 * </FormTopBar>
 * <FormContainer
 *   title="Create a thing"
 *   aside={
 *     <FormInfoBox>
 *       Some info
 *     </FormInfoBox>
 *   }
 * >
 *   <FormSection title="General">
 *     <FormControl>
 *       <FormLabel variant="inlineLabeledInput">Name</FormLabel>
 *       <Input />
 *       <FormErrorMessage variant="inlineLabeledInput">{error}</FormErrorMessage>
 *     </FormControl>
 *   </FormSection>
 * </FormContainer>
 * ```
 */

const FORM_COLUMN_GAP = 60;

export interface FormTopBarProps {
  title: string;
  backButtonHref: string;
}

export const FormTopBar = ({
  title,
  backButtonHref,
  children,
}: React.PropsWithChildren<FormTopBarProps>) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();

  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      px="4"
      py="3"
      boxSizing="border-box"
      borderBottom="1px solid"
      borderBottomColor={semanticColors.border.primary}
    >
      <Flex alignItems="center">
        <Box
          pr="4"
          mr="4"
          borderRight={`1px solid ${semanticColors.border.secondary}`}
        >
          <CloseButton
            as={NavLink}
            to={backButtonHref}
            height="24px"
            width="24px"
          />
        </Box>
        <Text fontWeight="500" fontSize="14px" lineHeight="16px">
          {title}
        </Text>
      </Flex>
      {children}
    </Flex>
  );
};

export interface FormSectionProps {
  title: string;
}

export const FormSection = ({
  title,
  children,
}: React.PropsWithChildren<FormSectionProps>) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();

  return (
    <Box mb="40px">
      <Text
        as="legend"
        fontWeight="500"
        fontSize="14px"
        lineHeight="16px"
        color={semanticColors.foreground.tertiary}
        mb="6"
      >
        {title}
      </Text>
      {children}
    </Box>
  );
};

export const FormInfoBox = ({ children }: React.PropsWithChildren) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();

  return (
    <Box
      flex="1"
      borderLeft={`1px solid ${semanticColors.border.primary}`}
      px="6"
      py="2"
      as="aside"
      mr="20"
    >
      {children}
    </Box>
  );
};

export interface FormContainerProps {
  title: string;
  aside?: React.ReactElement;
}

export const FormContainer = ({
  title,
  children,
  aside,
}: React.PropsWithChildren<FormContainerProps>) => {
  return (
    <Box mt={10}>
      <Grid
        templateColumns="1fr 420px 1fr"
        templateRows="auto 1fr"
        columnGap={`${FORM_COLUMN_GAP}px`}
        rowGap="10"
        alignItems="start"
        justifyContent="center"
      >
        <Box gridColumnStart="2">
          <Text as="h1" fontSize="20px" fontWeight="600" lineHeight="24px">
            {title}
          </Text>
        </Box>
        <Box gridColumnStart="2">{children}</Box>
        {aside}
      </Grid>
    </Box>
  );
};

export const GutterContainer = ({ children }: React.PropsWithChildren) => {
  return (
    <Flex
      justifyContent="center"
      position="absolute"
      right={`-${FORM_COLUMN_GAP}px`}
      width={`${FORM_COLUMN_GAP}px`}
      height={`${FORM_COLUMN_GAP}px`}
      p="0"
    >
      {children}
    </Flex>
  );
};

export interface InlineLabeledInputProps {
  label: string;
  error?: string;
}

export const InlineLabeledInput = ({
  label,
  error,
  children,
}: React.PropsWithChildren<InlineLabeledInputProps>) => {
  return (
    <Grid
      templateColumns="min-content minmax(auto, 320px)"
      columnGap="6"
      justifyContent="space-between"
      alignItems="center"
    >
      <FormLabel variant="inline">{label}</FormLabel>
      {children}
      <Box gridColumn="2">
        <FormErrorMessage>{error}</FormErrorMessage>
      </Box>
    </Grid>
  );
};
