import { tabsAnatomy as parts } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/styled-system";

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(parts.keys);

const variantLine = definePartsStyle(({ theme }) => {
  const { colors } = theme;
  return {
    tab: {
      _active: {
        borderBottomColor: colors.accent.purple,
      },
      borderBottomWidth: "1px",
      marginBottom: "-1px",
      px: 0,
      mr: 10,
    },
    tablist: {
      borderBottomColor: colors.border.primary,
      borderBottomWidth: "1px",
    },
    tabpanel: {
      p: 0,
    },
  };
});

const variantSoftRounded = definePartsStyle(({ theme }) => {
  const { colors, textStyles } = theme;

  return {
    tab: {
      ...textStyles["text-ui-med"],
      borderRadius: "base",
      px: 3,
      color: colors.foreground.secondary,
      height: 6,
      _selected: {
        color: colors.foreground.primary,
        bg: colors.background.secondary,
      },
    },
    tablist: {
      columnGap: 2,
      height: 8,
      borderBottomColor: colors.border.primary,
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
