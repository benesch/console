import { Box, CloseButton, Flex, Text, useTheme } from "@chakra-ui/react";
import React from "react";
import { NavLink } from "react-router-dom";

import { MaterializeTheme } from "~/theme";

export interface FormTopBarProps {
  title: string;
}

const FormTopBar = ({
  title,
  children,
}: React.PropsWithChildren<FormTopBarProps>) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();

  return (
    <Flex alignItems="center" justifyContent="space-between" p="4">
      <Flex alignItems="center">
        <Box
          pr="4"
          mr="4"
          borderRight={`1px solid ${semanticColors.border.secondary}`}
        >
          <CloseButton as={NavLink} to=".." height="24px" width="24px" />
        </Box>
        <Text fontWeight="500" fontSize="14px" lineHeight="16px">
          {title}
        </Text>
      </Flex>
      {children}
    </Flex>
  );
};

export default FormTopBar;
