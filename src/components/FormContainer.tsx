import { Box, Grid, Text } from "@chakra-ui/react";
import React from "react";

import { FORM_COLUMN_GAP } from "~/theme/components/Form";

export interface FormTopBarProps {
  title: string;
  aside?: React.ReactElement;
}

export const FormContainer = ({
  title,
  children,
  aside,
}: React.PropsWithChildren<FormTopBarProps>) => {
  return (
    <Box mt={10}>
      <Grid
        templateColumns="1fr 420px 1fr"
        templateRows="auto 1fr"
        columnGap={`${FORM_COLUMN_GAP}px`}
        rowGap="10"
        alignItems="start"
        justifyContent="center"
      >
        <Box gridColumnStart="2">
          <Text as="h1" fontSize="20px" fontWeight="600" lineHeight="24px">
            {title}
          </Text>
        </Box>
        <Box gridColumnStart="2">{children}</Box>
        {aside}
      </Grid>
    </Box>
  );
};

export default FormContainer;
