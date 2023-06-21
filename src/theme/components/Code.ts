import { defineStyleConfig } from "@chakra-ui/react";

export const codeTheme = defineStyleConfig({
  defaultProps: {
    variant: "shell",
  },
  variants: {
    shell: {
      lineHeight: 6,
      padding: 0,
    },
  },
});
