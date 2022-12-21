import { Box, BoxProps, useTheme } from "@chakra-ui/react";
import React from "react";

export type AlertBoxProp = BoxProps;
const AlertBox = (props: AlertBoxProp) => {
  const { colors } = useTheme();
  return (
    <Box
      width="100%"
      bg={colors.semanticColors.background.error}
      border={`solid 1px ${colors.semanticColors.border.error}`}
      rounded="lg"
      p={4}
      {...props}
    />
  );
};

export default AlertBox;
