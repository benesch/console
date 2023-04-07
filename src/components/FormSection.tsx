import { Box, Text, useTheme } from "@chakra-ui/react";
import React from "react";

import { MaterializeTheme } from "~/theme";

export interface FormSectionProps {
  title: string;
}

const FormSection = ({
  title,
  children,
}: React.PropsWithChildren<FormSectionProps>) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();

  return (
    <Box mb="40px">
      <Text
        as="legend"
        fontWeight="500"
        fontSize="14px"
        lineHeight="16px"
        color={semanticColors.foreground.tertiary}
        mb="6"
      >
        {title}
      </Text>
      {children}
    </Box>
  );
};

export default FormSection;
