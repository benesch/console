import { Box, useTheme } from "@chakra-ui/react";
import React from "react";

import { MaterializeTheme } from "~/theme";

const CommandChevron = () => {
  const { colors } = useTheme<MaterializeTheme>();

  return (
    <Box fontSize="lg" lineHeight="6" color={colors.accent.purple}>
      &gt;
    </Box>
  );
};

export default CommandChevron;
