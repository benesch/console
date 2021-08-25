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
import { StyleFunctionProps } from "@chakra-ui/theme-tools";
import { ThemeOptions } from "@frontegg/react";

// Colors shared between the Chakra UI and Frontegg themes.
const colorPrimary = "#472f85";
const colorPrimaryActive = "#1b164c";
const colorPrimaryLight = "#aaa5b6";
const colorError = "#cf290b";
const colorErrorActive = "#af2000";

export const chakraTheme = extendTheme({
  components: {
    Alert: {
      variants: {
        subtle: (props: StyleFunctionProps) => ({
          container: {
            borderWidth: "1px",
            borderColor: `${props.colorScheme}.400`,
            borderRadius: "4px",
          },
        }),
      },
    },
    Button: {
      baseStyle: {
        borderRadius: "3px",
      },
    },
    Modal: {
      baseStyle: {
        header: {
          borderBottom: "1px solid",
          borderBottomColor: "gray.200",
          fontWeight: "400",
        },
        footer: {
          borderTop: "1px solid",
          borderTopColor: "gray.200",
        },
      },
    },
    Tabs: {
      variants: {
        line: {
          tab: {
            borderBottomWidth: "3px",
            marginBottom: "0",
          },
          tablist: {
            borderBottomWidth: "1px",
            borderBottomColor: "gray.100",
          },
        },
      },
    },
  },
  colors: {
    blue: {
      100: "#e8ecf2",
    },
    purple: {
      500: colorPrimary,
      600: colorPrimaryActive,
    },
    red: {
      500: colorError,
      600: colorErrorActive,
    },
  },
  fonts: {
    heading: "intervariable",
    body: "intervariable",
  },
  shadows: {
    footer: "0 -2px 1px #0000000d",
  },
  styles: {
    global: {
      body: {
        bg: "#f9f9f9",
      },
    },
  },
});

// Extracted from Figma.
export const fronteggAuthPageBackground = `
  radial-gradient(88.57% 72.27% at 6.45% 137.95%, #9b34cb 0%, rgba(155, 52, 203, 0) 100%),
  radial-gradient(81.76% 69.63% at 75.55% 107.58%, #5a34cb 0%, rgba(67, 52, 203, 0) 100%),
  #16123e
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

export const fronteggTheme: ThemeOptions = {
  adminPortal: {
    layout: {
      fullScreenMode: false,
    },
    typographyStyleOptions: {
      fontFamily: "intervariable",
    },
  },
  authPage: {
    loginBox: {
      // Frontegg's types incorrectly think this property is on `authPage`
      // directly, not nested in `loginBox`, so ignore the type error.
      // @ts-ignore
      backgroundCard: "white",
    },
  },
  palette: {
    error: {
      main: colorError,
    },
    primary: {
      main: colorPrimary,
      light: colorPrimaryLight,
      active: colorPrimaryActive,
      hover: colorPrimaryActive,
    },
  },
  typography: {
    body1Bold: {
      fontWeight: 500,
    },
    button: {
      fontFamily: "intervariable",
    },
  },
  typographyStyleOptions: {
    fontFamily: "intervariable",
  },
};
