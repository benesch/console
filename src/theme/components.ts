import { inputAnatomy, selectAnatomy, switchAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";
import {
  mode,
  StyleFunctionProps,
  transparentize,
} from "@chakra-ui/theme-tools";

import { MaterializeTheme } from ".";
import colors from "./colors";

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

export { Button } from "~/theme/components/Button";
export { FormLabel } from "~/theme/components/FormLabel";

export const Badge = {
  defaultProps: {
    variant: "solid",
  },
};

const {
  definePartsStyle: defineInputPartsStyle,
  defineMultiStyleConfig: defineInputStyleConfig,
} = createMultiStyleConfigHelpers(inputAnatomy.keys);

// TODO: The input doesn't seem to accept a lot of props. I'm not sure if this is a bug or if I'm doing something wrong.
export const Input = defineInputStyleConfig({
  baseStyle: defineInputPartsStyle({
    field: {
      padding: "8px",
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
  defaultProps: {
    variant: "default",
    size: "sm",
  },
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
    fullscreen: {
      dialog: {
        minWidth: "100%",
        minHeight: "100vh",
        m: 0,
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
  variants: {
    borderless: definePartsStyle({
      field: {
        color: "semanticColors.foreground.secondary",
        fontSize: "14px",
        height: "32px",
        lineHeight: "16px",
        rounded: "8px",
        _hover: {
          cursor: "pointer",
        },
        _focus: {
          background: "semanticColors.background.secondary",
        },
      },
    }),
  },
});

const {
  defineMultiStyleConfig: defineSwitchConfig,
  definePartsStyle: defineSwitchPartsStyle,
} = createMultiStyleConfigHelpers(switchAnatomy.keys);

export const Switch = defineSwitchConfig({
  defaultProps: {
    size: "sm",
  },
  baseStyle: defineSwitchPartsStyle({
    thumb: {
      backgroundBlendMode: "multiply, normal",
      background:
        "radial-gradient(100% 100% at 50% 0%, rgba(255, 255, 255, 0) 42.19%, rgba(0, 0, 0, 0.08) 100%), #FFFFFF",
      shadow:
        "0px 0px 0.5px rgba(0, 0, 0, 0.40), 0px 0.5px 2px rgba(0, 0, 0, 0.16)",
      _checked: {
        background:
          "radial-gradient(100% 100% at 50% 0%, rgba(255, 255, 255, 0) 42.19%, rgba(90, 52, 302, 0.24) 100%), #FFFFFF",
      },
    },
    track: {
      backgroundColor: "semanticColors.border.secondary",
      shadow:
        "inset 0px 0px 0.5px rgba(0, 0, 0, 0.16), inset 0px 0px 2px rgba(0, 0, 0, 0.08)",
      _checked: {
        backgroundColor: "semanticColors.accent.brightPurple",
        shadow:
          "inset 0px 0px 0.5px rgba(0, 0, 0, 0.16), inset 0px 0px 2px rgba(0, 0, 0, 0.12), 0 0 4px 0 rgba(90, 52, 302, 0.16)",
      },
      _focus: {
        shadow:
          "0 0 0 2px rgba(255, 255, 255, 1), 0 0 0 4px rgba(90, 52, 203, 0.24)",
      },
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
    line: ({ theme }: StyleFunctionProps) => {
      const {
        colors: { semanticColors },
      } = theme as MaterializeTheme;
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
          px: 0,
          py: 0,
        },
      };
    },
  },
  defaultProps: {
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
  defaultProps: {
    variant: "borderless",
  },
  variants: {
    borderless: {
      container: {
        border: "none",
      },
      button: {
        p: 0,
      },
      panel: {
        mt: 6,
        p: 0,
      },
    },
  },
};
