import { Box, BoxProps, useTheme } from "@chakra-ui/react";
import React from "react";

import { MaterializeTheme } from "~/theme";

type CommandChevronProps = BoxProps;

const CommandChevron = (props: CommandChevronProps) => {
  const { colors } = useTheme<MaterializeTheme>();

  return (
    <Box
      {...props}
      fontSize="lg"
      lineHeight="5"
      color={props.color ?? colors.accent.purple}
    >
      &gt;
    </Box>
  );
};

export default CommandChevron;
