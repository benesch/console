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

import { SignupFooter } from "../components/signup_footer";
import colors, { gradients, semanticColors, shadows } from "./colors";
import * as components from "./components";

const fontDefault = "intervariable, Arial, sans-serif";

export const chakraTheme = extendTheme({
  global: {
    body: {
      fontFamily: fontDefault,
    },
  },
  components,
  colors: {
    ...colors,
    yellow: colors.honeysuckle,
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
        bg: mode(
          "#f9f9f9",
          `
        ${gradients.primary.gradient},
        ${gradients.primary.fallback}
      `
        )(props),
      },
    }),
  },
  gradients,
  config: {
    cssVarPrefix: "ck",
    initialColorMode: "dark",
    useSystemColorMode: true,
  },
});

// Extracted from Figma.
export const fronteggAuthPageBackground = `
  ${gradients.primary.gradient},
  ${gradients.primary.fallback}
`;

export const fronteggCustomStyles = `
/* Our logo is very wide and short, so make it bigger than normal. */
.fe-logo-wrapper img {
  width: 65%;
}

/* Add a missing period to the "Sign up." link for consistency with the
 * "Log in." link. */
[data-testid="redirect-to-signup"]:after {
  content: "."
}
`;

const fronteggTheme: FronteggThemeOptions = {
  adminPortal: {
    layout: {
      fullScreenMode: false,
    },
    typographyStyleOptions: {
      fontFamily: fontDefault,
    },
  },
  authPage: {
    inputError: {},
    loginBox: {
      // Frontegg's types incorrectly think this property is on `authPage`
      // directly, not nested in `loginBox`, so ignore the type error.
      // @ts-ignore
      // backgroundCard: "white",
    },
  },
  loginBox: {
    signup: {
      footer: SignupFooter,
    },
  },
  typography: {
    body1Bold: {
      fontWeight: 500,
    },
    button: {
      fontFamily: fontDefault,
    },
  },
  typographyStyleOptions: {
    fontFamily: fontDefault,
  },
};

export const getFronteggTheme = (mode: "light" | "dark") => ({
  mode,
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
