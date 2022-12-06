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

import { extendTheme } from "@chakra-ui/react";
import { mode, StyleFunctionProps } from "@chakra-ui/theme-tools";
import { FronteggThemeOptions } from "@frontegg/react";
import React from "react";

import logo from "~/img/wordmark.svg";
import SignupFooter from "~/layouts/SignupFooter";
import colors, { gradients, semanticColors, shadows } from "~/theme/colors";
import * as components from "~/theme/components";

const fontDefault = "intervariable, Arial, sans-serif";

export const chakraTheme = extendTheme({
  global: {
    body: {
      fontFamily: fontDefault,
    },
  },
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
    heading: `"Encoding Sans Expanded", ${fontDefault}`,
    body: fontDefault,
    mono: "'Fira Code', Menlo, monospace",
  },
  shadows,
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        bg: mode(semanticColors.bg.light, semanticColors.bg.dark)(props),
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
  gradients,
  config: {
    cssVarPrefix: "ck",
    initialColorMode: "system",
    useSystemColorMode: true,
  },
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
      image: () => <img src={logo} />,
      placement: "page",
    },
  },
  typographyStyleOptions: {
    fontFamily: fontDefault,
  },
};

export const getFronteggTheme = (frontEggMode: "light" | "dark") => ({
  mode: frontEggMode,
  ...fronteggTheme,
  /* TODO wait for full frontegg styleability before attempting dark mode there */
  .../*(mode === "light"
    ? */ {
    palette: {
      error: {
        main: colors.red[500],
        active: colors.red[600],
      },
      primary: {
        main: colors.purple[600],
        light: colors.purple[200],
        active: colors.purple[800],
        hover: colors.purple[800],
      },
      background: {
        default: semanticColors.card.bg.light,
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

export const reactSelectTheme = {
  colors: {
    primary: colors.purple[500],
    primary25: colors.purple[100],
    primary50: colors.purple[200],
    primary75: colors.purple[400],
    danger: colors.red[400],
    dangerLight: colors.red[100],
    neutral0: colors.white,
    neutral5: colors.gray[50],
    neutral10: colors.gray[100],
    neutral20: colors.gray[200],
    neutral30: colors.gray[300],
    neutral40: colors.gray[400],
    neutral50: colors.gray[500],
    neutral60: colors.gray[600],
    neutral70: colors.gray[700],
    neutral80: colors.gray[800],
    neutral90: colors.gray[900],
  },
};
