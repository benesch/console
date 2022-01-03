import {
  mode,
  StyleFunctionProps,
  transparentize,
} from "@chakra-ui/theme-tools";

import { semanticColors } from "./colors";

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
};

export const Tabs = {
  variants: {
    line: (props: StyleFunctionProps) => {
      const { colorScheme: c } = props;
      return {
        tab: {
          borderBottomWidth: "3px",
          marginBottom: "0",
        },
        tablist: {
          borderBottomWidth: "1px",
          borderColor: mode(`${c}.100`, `${c}.600`)(props) as string,
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
  }),
  defaultProps: {
    colorScheme: "gray",
  },
};

export const Accordion = {
  baseStyle: {
    container: {
      border: "none",
    },
  },
};
