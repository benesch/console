import { tabsAnatomy as parts } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/styled-system";

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(parts.keys);

const variantLine = definePartsStyle(({ theme }) => {
  const {
    colors: { semanticColors },
  } = theme;
  return {
    tab: {
      _active: {
        borderBottomColor: semanticColors.accent.purple,
      },
      borderBottomWidth: "1px",
      marginBottom: "-1px",
      px: 0,
      mr: 10,
    },
    tablist: {
      borderBottomColor: semanticColors.border.primary,
      borderBottomWidth: "1px",
    },
    tabpanel: {
      p: 0,
    },
  };
});

const variantSoftRounded = definePartsStyle(({ theme }) => {
  const {
    colors: { semanticColors },
    textStyles,
  } = theme;

  return {
    tab: {
      ...textStyles["text-ui-med"],
      borderRadius: "base",
      px: 3,
      color: semanticColors.foreground.secondary,
      height: 6,
      _selected: {
        color: semanticColors.foreground.primary,
        bg: semanticColors.background.secondary,
      },
    },
    tablist: {
      columnGap: 2,
      height: 8,
      borderBottomColor: semanticColors.border.primary,
      borderBottomWidth: "1px",
    },
    tabpanel: {
      p: 0,
      my: 6,
    },
  };
});

const sizes = {
  sm: definePartsStyle({
    tab: {
      fontSize: "sm",
      py: 1,
      px: 3,
    },
  }),
};

const variants = {
  "soft-rounded": variantSoftRounded,
  line: variantLine,
};

export const tabsTheme = defineMultiStyleConfig({
  variants,
  sizes,
  defaultProps: {
    variant: "line",
  },
});
