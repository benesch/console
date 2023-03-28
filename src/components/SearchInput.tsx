import { SearchIcon } from "@chakra-ui/icons";
import { Box, Input, InputProps } from "@chakra-ui/react";
import React from "react";

const SearchInput = (props: InputProps) => {
  return (
    <Box position="relative">
      <Input pl="8" placeholder="Search" {...props} />
      <SearchIcon
        position="absolute"
        left="8px"
        top="0"
        bottom="0"
        marginY="auto"
      />
    </Box>
  );
};

export default SearchInput;
