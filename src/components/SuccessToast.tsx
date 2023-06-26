import {
  Box,
  HStack,
  Text,
  ToastPosition,
  useTheme,
  useToast,
} from "@chakra-ui/react";
import { UseToastOptions } from "@chakra-ui/toast";
import React from "react";

import { CheckmarkIconWithCircle } from "~/svg/CheckmarkIcon";
import { MaterializeTheme } from "~/theme";

export interface SuccessToastComponentProps {
  icon?: React.ReactNode;
  description?: React.ReactNode;
}

const SuccessToastComponent = ({
  icon,
  description,
}: SuccessToastComponentProps) => {
  const { colors, shadows } = useTheme<MaterializeTheme>();

  return (
    <Box
      bg={colors.background.primary}
      alignItems="start"
      shadow={shadows.level3}
      border="1px solid"
      borderRadius="lg"
      borderColor={colors.border.primary}
      px="6"
      py="4"
      width="auto"
      minW="360px"
      mb="6"
      mr="6"
    >
      <HStack spacing="4">
        <Box>{icon}</Box>
        <Text
          fontWeight="500"
          fontSize="sm"
          color={colors.foreground.secondary}
        >
          {description}
        </Text>
      </HStack>
    </Box>
  );
};

export interface SuccessToastOptions {
  description?: React.ReactNode;
}

const TOAST_DURATION = 2000;

/**
 * Wraps useToast to use a custom render function and expose our own API
 */
export const useSuccessToast = (options?: SuccessToastOptions) => {
  const render = (props: UseToastOptions) => (
    <SuccessToastComponent icon={<CheckmarkIconWithCircle />} {...props} />
  );

  const toast = useToast({
    position: "bottom-right" as ToastPosition,
    duration: TOAST_DURATION,
    render,
    ...options,
  });

  return (optionsOverride?: SuccessToastOptions) => toast(optionsOverride);
};

export default useSuccessToast;
