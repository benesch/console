import { SearchIcon } from "@chakra-ui/icons";
import { Box, BoxProps, Input, InputProps, useTheme } from "@chakra-ui/react";
import React from "react";

import { MaterializeTheme } from "~/theme";

export interface SearchInputProps extends InputProps {
  containerProps?: BoxProps;
}

const SearchInput = ({ containerProps, ...props }: SearchInputProps) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  return (
    <Box as="div" position="relative" {...containerProps}>
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
