import { Box, useTheme } from "@chakra-ui/react";
import React from "react";

import { MaterializeTheme } from "~/theme";

const FullScreen = ({ children }: React.PropsWithChildren) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();

  return (
    <Box
      position="absolute"
      width="100%"
      height="100%"
      left="0"
      background={semanticColors.background.primary}
    >
      {children}
    </Box>
  );
};

export default FullScreen;
