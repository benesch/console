import {
  Box,
  BoxProps,
  Button,
  Heading,
  HStack,
  PropsOf,
  Text,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import React from "react";

import { MaterializeTheme } from "~/theme";

export interface InlayBannerProps extends BoxProps {
  variant: "error" | "info" | "warn";
  children?: React.ReactNode;
  label?: React.ReactNode;
  message?: React.ReactNode;
  showButton?: boolean;
  buttonText?: string;
  buttonProps?: PropsOf<typeof Button>;
}

export const InlayBanner = ({
  variant,
  children,
  label = "",
  message = "",
  showButton = false,
  buttonText = "View details",
  buttonProps = {},
  ...props
}: InlayBannerProps) => {
  const { colors } = useTheme<MaterializeTheme>();

  const colorScheme = {
    error: {
      border: colors.border.error,
      background: colors.background.error,
    },
    info: {
      border: colors.border.info,
      background: colors.background.info,
    },
    warn: {
      border: colors.border.warn,
      background: colors.background.warn,
    },
  };

  return (
    <Box
      borderRadius="lg"
      borderColor={colorScheme[variant].border}
      borderWidth="1px"
      overflow="hidden"
      {...props}
    >
      <Box p="4" background={colorScheme[variant].background}>
        <HStack spacing={10} justifyContent="space-between">
          <VStack spacing="1" alignItems="start">
            <Heading
              as="h6"
              fontSize="sm"
              lineHeight="16px"
              fontWeight="500"
              opacity="0.5"
              color={colors.foreground.primary}
            >
              {label}
            </Heading>
            <Text
              fontSize="sm"
              lineHeight="20px"
              color={colors.foreground.primary}
            >
              {message}
            </Text>
          </VStack>
          {showButton ? (
            <Button
              variant="secondary"
              size="sm"
              flexShrink={0}
              bg={colors.background.primary}
              {...buttonProps}
            >
              {buttonText}
            </Button>
          ) : null}
        </HStack>
      </Box>
      {children}
    </Box>
  );
};

export default InlayBanner;
