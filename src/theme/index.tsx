/**
 * @module
 * Theme configuration.
 *
 * NOTE(benesch): this configuration was thrown together quickly to make the few
 * UI elements in use match the "Open Beta" Figma. Over time, we should make
 * the Chakra UI theme the source of truth and ensure it is comprehensive enough
 * to cover the full set of UI elements. Frontegg makes this a bit complicated,
 * because the important colors need to be plumbed through both Chakra and
 * Frontegg.
 */

import { ChakraTheme, extendTheme, Flex } from "@chakra-ui/react";
import { mode, StyleFunctionProps } from "@chakra-ui/theme-tools";
import { FronteggThemeOptions } from "@frontegg/react";
import React from "react";

import logo from "~/img/wordmark.svg";
import SignupFooter from "~/layouts/SignupFooter";
import colors, { gradients } from "~/theme/colors";
import * as components from "~/theme/components";

import { darkColors, darkShadows } from "./dark";
import { lightColors, lightShadows } from "./light";

export interface ThemeColors {
  accent: {
    purple: string;
    brightPurple: string;
    green: string;
    red: string;
  };
  foreground: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    error: string;
    info: string;
    warn: string;
    inverse: string;
  };
  border: {
    primary: string;
    secondary: string;
    error: string;
    info: string;
    warn: string;
  };
  lineGraph: string[];
}

export interface ThemeShadows {
  level1: string;
  level2: string;
  level3: string;
  level4: string;
}

const fontDefault = "intervariable, Arial, sans-serif";

export const initialColorMode = "system";
export const config: ChakraTheme["config"] = {
  cssVarPrefix: "ck",
  initialColorMode,
  useSystemColorMode: true,
};

export interface MaterializeTheme extends ChakraTheme {
  colors: ChakraTheme["colors"] & {
    semanticColors: ThemeColors;
  };
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  shadows: ChakraTheme["shadows"] & ThemeShadows;
  radii: ChakraTheme["radii"] & {
    none: "0";
    sm: "0.125rem"; // 2px
    base: "0.25rem"; // 4px
    md: "0.375rem"; // 6px
    lg: "0.5rem"; // 8px
    xl: "0.75rem"; // 12px
    "2xl": "1rem"; // 16px
    "3xl": "1.5rem"; // 24px
    full: "9999px";
  };
  space: {
    px: "1px";
    0.5: "0.125rem";
    1: "0.25rem";
    1.5: "0.375rem";
    2: "0.5rem";
    2.5: "0.625rem";
    3: "0.75rem";
    3.5: "0.875rem";
    4: "1rem";
    5: "1.25rem";
    6: "1.5rem";
    7: "1.75rem";
    8: "2rem";
    9: "2.25rem";
    10: "2.5rem";
    12: "3rem";
    14: "3.5rem";
    16: "4rem";
    20: "5rem";
    24: "6rem";
    28: "7rem";
    32: "8rem";
    36: "9rem";
    40: "10rem";
    44: "11rem";
    48: "12rem";
    52: "13rem";
    56: "14rem";
    60: "15rem";
    64: "16rem";
    72: "18rem";
    80: "20rem";
    96: "24rem";
  };
}

export const baseTheme: Partial<ChakraTheme> = {
  breakpoints: {
    sm: "30em", // 480px
    md: "48em", // 768px
    lg: "62em", // 992px
    xl: "80em", // 1280px
    "2xl": "96em", // 1536px
    "3xl": "120em", // 1920px
    "4xl": "160em", // 2560px
  },
  components,
  colors: {
    ...colors,
    teal: colors.turquoise,
    pink: colors.orchid,
    // our "blue" is closer to cyan, and we have "cobalt" also, hence remapping
    cyan: colors.blue,
    blue: colors.cobalt,
    // nb: style guide color palettes without a standard chakra equivalent: indigo, lavender
  },
  fonts: {
    heading: fontDefault,
    body: fontDefault,
    mono: "'Roboto Mono', Menlo, monospace",
  },
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        bg: mode(colors.white, colors.gray[900])(props),
      },
      "*": {
        fontVariantLigatures: "none",
      },
      iframe: {
        // Prevents background color issue with statuspage.io iframes
        colorScheme: "light",
      },
    }),
  },
  radii: {
    none: "0",
    sm: "0.125rem", // 2px
    base: "0.25rem", // 4px
    md: "0.375rem", // 6px
    lg: "0.5rem", // 8px
    xl: "0.75rem", // 12px
    "2xl": "1rem", // 16px
    "3xl": "1.5rem", // 24px
    full: "9999px",
  } as MaterializeTheme["radii"],
  config,
};

export const darkTheme = extendTheme(baseTheme, {
  colors: {
    semanticColors: darkColors,
  },
  shadows: darkShadows,
});

export const lightTheme = extendTheme(baseTheme, {
  colors: {
    semanticColors: lightColors,
  },
  shadows: lightShadows,
});

// Extracted from Figma.
export const fronteggAuthPageBackground = `
  ${gradients.primary.gradient},
  ${gradients.primary.fallback}
`;
const fronteggTheme: FronteggThemeOptions = {
  loginBox: {
    boxStyle: {
      backgroundColor: "white",
    },
    signup: {
      boxFooter: () => SignupFooter,
    },
    logo: {
      image: () => (
        <Flex w="100%" justifyContent="center">
          <img src={logo} />
        </Flex>
      ),
      placement: "page",
    },
  },
};

export const getFronteggTheme = (
  _frontEggMode: "light" | "dark"
): FronteggThemeOptions => ({
  ...fronteggTheme,
  /* TODO wait for full frontegg styleability before attempting dark mode there */
  .../*(mode === "light"
    ? */ {
    palette: {
      error: {
        main: colors.red[500],
      },
      primary: {
        main: colors.purple[600],
        light: colors.purple[200],
        active: colors.purple[800],
        hover: colors.purple[800],
      },
      background: {
        default: colors.white,
      },
    },
    // navigation: {
    //   background: semanticColors.card.bg.light,
    // },
  },
  /*: {
        palette: {
          error: {
            main: colors.red[300],
            active: colors.red[200],
          },
          primary: {
            main: colors.purple[300],
            light: colors.purple[700],
            active: colors.purple[200],
            hover: colors.purple[200],
          },
          background: {
            default: chakraTheme.colors.component.card.bg.dark,
          },
        },
        navigation: {
          background: chakraTheme.colors.component.dropdown.bg.dark,
          headerColor: colors.white,
          subHeaderColor: colors.gray[100],
          groupTitleColor: colors.orange[200],
          color: colors.white,
          avatarColor: colors.orchid[400],
          avatarBgColor: colors.trueBlack,
          default: {
            color: colors.gray[100],
            borderColor: "transparent",
            avatarColor: colors.orchid[400],
            avatarBgColor: colors.trueBlack,
          },
          hover: {
            color: colors.white,
            background: colors.gray[800],
            borderColor: colors.gray[700],
            avatarColor: colors.orchid[400],
            avatarBgColor: colors.gray[800],
          },
          selected: {
            color: colors.gray[50],
            background: colors.gray[900],
            borderColor: colors.gray[900],
            avatarColor: colors.orchid[400],
            avatarBgColor: colors.gray[900],
          },
        },
      })*/
});
