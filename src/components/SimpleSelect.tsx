import { Select, SelectProps, useTheme } from "@chakra-ui/react";
import * as React from "react";

export type SimpleSelectProps = SelectProps;

const SimpleSelect = (props: SimpleSelectProps) => {
  const {
    colors: { semanticColors },
  } = useTheme();
  return (
    <Select
      fontSize="14px"
      lineHeight="16px"
      fontFamily="Inter"
      width="auto"
      rounded="8px"
      borderWidth="1px"
      boxShadow="
        0px 1px 3px 0px hsla(0, 0%, 0%, 0.06), 
        0px 1px 1px 0px hsla(0, 0%, 0%, 0.04),
        0px 0px 0px 0px hsla(0, 0%, 0%, 0)" // for performance while transitioning
      transition="box-shadow 50ms ease-out"
      sx={{
        _hover: {
          cursor: "pointer",
        },
        _focus: {
          borderColor: semanticColors.accent.brightPurple,
          boxShadow:
            "0px 0px 0px 0px hsla(0, 0%, 0%, 0), 0px 0px 0px 0px hsla(0, 0%, 0%, 0), 0px 0px 0px 2px hsla(257, 100%, 65%, 0.24)", // accent.brightPurple,
        },
      }}
      borderColor={semanticColors.border.secondary}
      {...props}
    />
  );
};

export default SimpleSelect;
