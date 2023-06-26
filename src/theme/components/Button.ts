import { gradients, shadows } from "../colors";

export const Button = {
  baseStyle: {
    borderRadius: "lg",
    useSelect: "none",
    fontSize: "14px",
    lineHeight: "16px",
    fontWeight: 500,
  },
  variants: {
    borderless: {
      color: "foreground.secondary",
      fontSize: "14px",
      lineHeight: "16px",
      fontWeight: 500,
      backgroundColor: "background.primary",
      transition: "all 0.1s cubic-bezier(0.4, 0, 0.2, 1)",
      _hover: {
        backgroundColor: "background.secondary",
      },
    },
    secondary: {
      color: "foreground.primary",
      backgroundColor: "background.primary",
      borderWidth: "1px",
      borderColor: "border.secondary",
      shadow: shadows.light.level1,
      transition: "all 0.1s cubic-bezier(0.4, 0, 0.2, 1)",
      _hover: {
        shadow: "none",
        backgroundColor: "background.secondary",
      },
    },
    primary: {
      color: "foreground.primaryButtonLabel",
      fontSize: "14px",
      lineHeight: "16px",
      fontWeight: 500,
      backgroundColor: "accent.purple",
      shadow: "shadows.level1",
      transition: "all 0.1s cubic-bezier(0.4, 0, 0.2, 1)",
      _hover: {
        shadow: "none",
        _disabled: {
          backgroundColor: "accent.purple",
        },
      },
    },
    tertiary: {
      color: "semanticColors.foreground.primary",
      backgroundColor: "semanticColors.background.tertiary",
      borderColor: "semanticColors.border.secondary",

      borderWidth: "1px",
      shadow: shadows.light.level2,
    },
    outline: {
      transition: "all 0.1s cubic-bezier(0.4, 0, 0.2, 1)",
      _hover: {
        backgroundColor: "background.secondary",
      },
    },
    "gradient-1": {
      color: "offWhite",
      backgroundColor: gradients.accentDark1.fallback,
      background: gradients.accentDark1.gradient,
      shadow: shadows.light.level2,
      ...gradients.accentDark1.animation,
      ":hover": {
        color: "white",
        ...gradients.accentDark1.animation[":hover"],
      },
      "[disabled], :hover[disabled]": {
        color: "white",
        background: gradients.accentDark1.gradient,
        backgroundPosition: gradients.accentDark1.animation.backgroundPosition,
        backgroundSize: gradients.accentDark1.animation.backgroundSize,
      },
    },
  },
};
