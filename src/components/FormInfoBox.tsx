import { Box, useTheme } from "@chakra-ui/react";
import React from "react";

import { MaterializeTheme } from "~/theme";

const FormInfoBox = ({ children }: React.PropsWithChildren) => {
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

export default FormInfoBox;
