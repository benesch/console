import { SearchIcon } from "@chakra-ui/icons";
import { Box, Input, InputProps, useTheme } from "@chakra-ui/react";
import React from "react";

import { MaterializeTheme } from "~/theme";

const SearchInput = (props: InputProps) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  return (
    <Box as="div" position="relative">
      <Input pl="32px" minWidth="256px" placeholder="Search" {...props} />
      <Box
        position="absolute"
        left="4px"
        top="0"
        bottom="0"
        display="flex"
        alignItems="center"
        pl="2"
      >
        <SearchIcon color={semanticColors.foreground.secondary} />
      </Box>
    </Box>
  );
};

export default SearchInput;
