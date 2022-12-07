import { createMultiStyleConfigHelpers } from "@chakra-ui/react";
import {
  mode,
  StyleFunctionProps,
  transparentize,
} from "@chakra-ui/theme-tools";

import { CARD_PADDING } from "../components/cardComponents";
import colors, { gradients, semanticColors, shadows } from "./colors";

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
    borderRadius: "sm",
    colorScheme: "purple",
  },
  variants: {
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

export const Modal = {
  baseStyle: (props: StyleFunctionProps) => ({
    header: {
      border: "0",
      borderBottom: "1px solid",
      borderBottomColor: mode(
        semanticColors.divider.light,
        semanticColors.divider.dark
      )(props),
      fontWeight: "400",
    },
    dialog: {
      borderRadius: "xl",
    },
    footer: {
      border: "0",
      borderTop: "1px solid",
      borderTopColor: mode(
        semanticColors.divider.light,
        semanticColors.divider.dark
      )(props),
      fontWeight: "400",
    },
    closeButton: {
      right: "2",
    },
  }),
  defaultProps: {
    size: "xl",
  },
  variants: {
    "2xl": {
      dialog: {
        minWidth: "2xl",
        maxWidth: "2xl",
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

const { defineMultiStyleConfig } = createMultiStyleConfigHelpers([
  "table",
  "th",
]);

const tableBorderStyle = `solid 1px ${colors.gray[200]}`;
export const Table = defineMultiStyleConfig({
  baseStyle: {},
  variants: {
    borderless: {
      table: {
        borderCollapse: "separate",
        borderSpacing: 0,
      },
      th: {
        textTransform: "none",
        fontFamily: "body",
        fontSize: "sm",
        fontWeight: "normal",
        color: "gray.400",
        backgroundColor: "gray.50",
        border: tableBorderStyle,
        borderX: "none",
        "&:first-child": {
          borderRadius: "4px 0 0 4px",
          borderLeft: tableBorderStyle,
        },
        "&:last-child": {
          borderRadius: "0 4px 4px 0",
          borderRight: tableBorderStyle,
        },
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
