import { inputAnatomy, selectAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";
import {
  mode,
  StyleFunctionProps,
  transparentize,
} from "@chakra-ui/theme-tools";

import { CARD_PADDING } from "../components/cardComponents";
import colors, { gradients, shadows } from "./colors";

export const Alert = {
  variants: {
    pale: (props: StyleFunctionProps) => {
      const { theme, colorScheme: c } = props;
      return {
        container: {
          bg: mode(`${c}.50`, transparentize(`${c}.200`, 0.16)(theme))(props),
        },
      };
    },
  },
};

export const Badge = {
  defaultProps: {
    variant: "solid",
  },
};

export const Button = {
  baseStyle: {
    borderRadius: "lg",
  },
  variants: {
    secondary: {
      color: "semanticColors.foreground.primary",
      fontSize: "14px",
      lineHeight: "16px",
      fontWeight: 500,
      backgroundColor: "semanticColors.background.primary",
      borderWidth: "1px",
      borderColor: "semanticColors.border.secondary",
      shadow: shadows.light.level1,
      transition: "all 0.1s cubic-bezier(0.4, 0, 0.2, 1)",
      _hover: {
        shadow: "none",
        backgroundColor: "semanticColors.background.secondary",
      },
    },
    primary: {
      color: "#FFF", // we don't want this label color to be themeable
      fontSize: "14px",
      lineHeight: "16px",
      fontWeight: 500,
      backgroundColor: "semanticColors.accent.purple",
      shadow: shadows.light.level1,
      transition: "all 0.1s cubic-bezier(0.4, 0, 0.2, 1)",
      _hover: {
        shadow: "none",
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

const {
  definePartsStyle: defineInputPartsStyle,
  defineMultiStyleConfig: defineInputStyleConfig,
} = createMultiStyleConfigHelpers(inputAnatomy.keys);

export const Input = defineInputStyleConfig({
  baseStyle: defineInputPartsStyle({
    field: {
      height: "32px",
      fontSize: "14px",
      lineHeight: "16px",
      width: "100%",
      backgroundColor: "semanticColors.background.secondary",
      borderWidth: "1px",
      borderColor: "semanticColors.border.secondary",
      boxShadow: "0px 0px 0px 0px hsla(0, 0%, 0%, 0)",
      transition: "box-shadow 50ms ease-out",
      _hover: {
        cursor: "pointer",
      },
    },
  }),
  variants: {
    default: defineInputPartsStyle({
      field: {
        borderRadius: "lg",
        _focus: {
          backgroundColor: "semanticColors.background.primary",
          borderColor: "semanticColors.accent.brightPurple",
          boxShadow: "0px 0px 0px 2px hsla(257, 100%, 65%, 0.24)", // accent.brightPurple,
        },
      },
    }),
    error: defineInputPartsStyle({
      field: {
        borderRadius: "lg",
        borderColor: "semanticColors.accent.red",
        boxShadow: "0px 0px 0px 2px hsla(343, 95%, 46%, 0.24)", // accent.red,
        _focus: {
          backgroundColor: "semanticColors.background.primary",
        },
      },
    }),
  },
});

export const Modal = {
  baseStyle: (props: StyleFunctionProps) => ({
    overlay: {
      background: "rgba(0, 0, 0, 0.5)",
    },
    header: {
      border: "0",
      fontSize: "md",
      lineHeight: "16px",
      fontWeight: "500",
      pb: "0",
    },
    dialog: {
      borderRadius: "xl",
      backgroundColor: "semanticColors.background.primary",
      shadows: "shadows.level4",
    },
    body: {
      px: "24px",
      py: "16px",
    },
    footer: {
      border: "0",
      borderTop: "1px solid",
      borderTopColor: mode(colors.gray[100], colors.gray[700])(props),
      fontWeight: "400",
    },
    closeButton: {
      right: "2",
      color: "semanticColors.foreground.secondary",
    },
  }),
  defaultProps: {
    size: "md",
    backgroundColor: "semanticColors.background.primary",
  },
  variants: {
    "2xl": {
      dialog: {
        minWidth: "400px",
        maxWidth: "400px",
      },
    },
    "3xl": {
      dialog: {
        minWidth: "3xl",
        maxWidth: "3xl",
      },
    },
  },
};

const { defineMultiStyleConfig: defineSelectConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(selectAnatomy.keys);

export const Select = defineSelectConfig({
  baseStyle: definePartsStyle({
    icon: {
      color: "semanticColors.foreground.secondary",
    },
  }),
});

const { defineMultiStyleConfig } = createMultiStyleConfigHelpers([
  "table",
  "th",
]);

const tableBorderStyle = `solid 1px ${`semanticColors.border.secondary`}`;
export const Table = defineMultiStyleConfig({
  baseStyle: {},
  variants: {
    rounded: {
      table: {
        borderCollapse: "separate",
        borderSpacing: 0,
        borderRadius: "xl",
        borderWidth: "1px",
      },
      tr: {
        "&:last-child": {
          td: {
            border: "none",
          },
        },
      },
      td: {
        borderBottomWidth: "1px",
      },
      th: {
        borderBottomWidth: "1px",
      },
    },
    standalone: {
      table: {
        borderCollapse: "separate",
        borderSpacing: 0,
      },
      th: {
        textTransform: "none",
        fontFamily: "body",
        color: "semanticColors.foreground.secondary",
        fontSize: "sm",
        fontWeight: "500",
        backgroundColor: "semanticColors.background.secondary",
        border: tableBorderStyle,
        borderWidth: "1px",
        borderColor: "semanticColors.border.secondary",
        borderX: "none",
        "&:first-of-type": {
          borderRadius: "8px 0 0 8px",
          borderLeftWidth: "1px",
          borderLeftStyle: "solid",
          borderLeftColor: "semanticColors.border.secondary",
        },
        "&:only-child": {
          borderRadius: "8px",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "semanticColors.border.secondary",
        },
        "&:last-child:not(:only-child)": {
          borderRadius: "0 8px 8px 0",
          borderRightWidth: "1px",
          borderRightStyle: "solid",
          borderRightColor: "semanticColors.border.secondary",
        },
      },
      tr: {
        _hover: {
          bg: "semanticColors.background.secondary",
        },
      },
      td: {
        borderBottom: tableBorderStyle,
        borderBottomWidth: "1px",
        borderBottomColor: "semanticColors.border.primary",
      },
    },
  },
  sizes: {
    md: {
      th: {
        height: "32px",
        px: "4",
        py: "0",
        lineHeight: "4",
        fontSize: "sm",
      },
      td: {
        height: "40px",
        px: "4",
        py: "0",
        lineHeight: "4",
        fontSize: "sm",
      },
    },
  },
});

export const Tabs = {
  variants: {
    line: (props: StyleFunctionProps) => {
      const { colorScheme: c } = props;
      return {
        tab: {
          borderBottomWidth: "3px",
          marginBottom: "0",
          px: 3,
          py: 2,
        },
        tablist: {
          borderBottomWidth: "1px",
          borderColor: mode(`${c}.100`, `${c}.600`)(props) as string,
          px: CARD_PADDING,
          justifyContent: "flex-start",
        },
        tabpanel: {
          px: 0,
          py: 0,
        },
      };
    },
  },
  defaultProps: {
    colorScheme: "purple",
    variant: "line",
  },
};

const menuListBase = (props: StyleFunctionProps) => {
  const { colorScheme: c } = props;
  return {
    bg: mode("white", `${c}.700`)(props),
    color: mode(`${c}.600`, `${c}.100`)(props),
    rounded: "md",
    boxShadow: "lg",
    fontSize: "sm",
    py: "1",
  };
};

export const Menu = {
  baseStyle: (props: StyleFunctionProps) => ({
    list: menuListBase(props),
    groupTitle: {
      textTransform: "uppercase",
      fontSize: "0.9em",
      marginInlineStart: "0.8rem",
      marginInlineEnd: "0.8rem",
    },
  }),
  defaultProps: {
    colorScheme: "gray",
  },
};

export const Accordion = {
  variants: {
    borderless: {
      container: {
        border: "none",
      },
    },
  },
};
