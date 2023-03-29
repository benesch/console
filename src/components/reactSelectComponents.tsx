import { Box, Flex, HStack, Text, useTheme } from "@chakra-ui/react";
import React from "react";
import { DropdownIndicatorProps, GroupBase, OptionProps } from "react-select";

import CheckmarkIcon from "~/svg/CheckmarkIcon";
import { MaterializeTheme } from "~/theme";

export const DropdownIndicator = <
  Option,
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  _props: React.PropsWithChildren<DropdownIndicatorProps<Option, false, Group>>
) => {
  return (
    <Box pr="8px">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 6L8 10L12 6"
          stroke="#66626A"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
};

export const Option = <Option,>(
  props: React.PropsWithChildren<OptionProps<Option, false, GroupBase<Option>>>
) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  return (
    <Box
      ref={props.innerRef}
      {...props.innerProps}
      _hover={{
        backgroundColor: semanticColors.background.secondary,
      }}
      py="8px"
      pr="4"
      width="100%"
    >
      <HStack spacing="0" alignItems="center" justifyContent="start">
        <Flex justifyContent="center" width="40px">
          {props.isSelected && (
            <CheckmarkIcon color={semanticColors.accent.brightPurple} />
          )}
        </Flex>
        <Text fontSize="14px" lineHeight="16px" userSelect="none">
          {props.children}
        </Text>
      </HStack>
    </Box>
  );
};
