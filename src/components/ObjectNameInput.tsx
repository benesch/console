import { forwardRef, Input, InputProps } from "@chakra-ui/react";
import React from "react";

const ObjectNameInput = forwardRef<InputProps, "input">(
  ({ onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.target.value = e.target.value.replace(" ", "_");
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <Input
        ref={ref}
        onChange={handleChange}
        autoCorrect="off"
        size="sm"
        {...props}
      />
    );
  }
);

export default ObjectNameInput;
