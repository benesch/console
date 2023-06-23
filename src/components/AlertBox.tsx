import { Box, BoxProps, useTheme } from "@chakra-ui/react";
import React from "react";

import { MaterializeTheme } from "~/theme";

export type AlertBoxProp = BoxProps;
const AlertBox = (props: AlertBoxProp) => {
  const { colors } = useTheme<MaterializeTheme>();
  return (
    <Box
      width="100%"
      bg={colors.background.error}
      border={`solid 1px ${colors.border.error}`}
      rounded="lg"
      p={4}
      {...props}
    />
  );
};

export default AlertBox;
