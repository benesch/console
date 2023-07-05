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
    inline: {
      boxSizing: "border-box",
      textStyle: "monospace",
      lineHeight: "20px",
      color: "foreground.secondary",
      border: "1px solid",
      borderColor: "border.primary",
      backgroundColor: "background.secondary",
      borderRadius: "md",
      px: 1,
      mx: "2px",
    },
  },
});
