import { Select, useTheme } from "@chakra-ui/react";
import * as React from "react";

export interface SimpleSelectProps {
  children: React.ReactNode;
  value?: string | number; // TODO: this is probably too constraining. Need to figure out the right type sig here
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const SimpleSelect = ({ children, value, onChange }: SimpleSelectProps) => {
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
        0px 1px 3px 0px hsla(0, 0%, 0%, 0.06); 
        0px 1px 1px 0px hsla(0, 0%, 0%, 0.04);
        0px 0px 0px 0px hsla(257, 100%, 65%, 0.24)" // for performance while transitioning
      transition="box-shadow 50ms ease-out"
      sx={{
        _focus: {
          borderColor: semanticColors.accent.brightPurple,
          boxShadow: "0px 0px 0px 2px hsla(257, 100%, 65%, 0.24)", // accent.brightPurple,
        },
      }}
      borderColor={semanticColors.border.secondary}
      value={value}
      onChange={onChange}
    >
      {children}
    </Select>
  );
};

export default SimpleSelect;
