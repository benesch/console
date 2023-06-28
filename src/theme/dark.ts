/**
 * @module
 * Dark theme colors.
 *
 */

import { ThemeColors, ThemeShadows } from ".";
import colors from "./colors";

export const darkColors: ThemeColors = {
  accent: {
    purple: colors.purple[400],
    brightPurple: colors.purple[300],
    green: colors.green[400],
    red: colors.red[400],
  },
  foreground: {
    primary: colors.gray[50],
    secondary: colors.gray[400],
    tertiary: "#807B84",
    inverse: colors.gray[900],
    primaryButtonLabel: colors.white,
  },
  background: {
    primary: colors.gray[900],
    secondary: colors.gray[800],
    tertiary: colors.gray[700],
    shellTutorial: "#18181B",
    error: colors.red[700],
    info: colors.blue[900],
    warn: colors.yellow[900],
    inverse: colors.gray[200],
  },
  border: {
    primary: colors.gray[700],
    secondary: colors.gray[600],
    error: colors.red[600],
    info: colors.blue[700],
    warn: colors.yellow[800],
  },
  lineGraph: [
    colors.cobalt[200],
    colors.turquoise[400],
    colors.blue[200],
    colors.yellow[300],
    colors.green[300],
  ],
};

export const darkShadows: ThemeShadows = {
  level1: `
      box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.24);
      box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.16);
    `,
  level2: `
      box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.24);
      box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.24);
      box-shadow: 0px 4px 9px 0px rgba(0, 0, 0, 0.24);
    `,
  level3: `
      box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.24);
      box-shadow: 0px 4px 6px 0px rgba(0, 0, 0, 0.24);
      box-shadow: 0px 6px 8px 0px rgba(0, 0, 0, 0.24);
      box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.24);
    `,
  level4: `
      box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.24);
      box-shadow: 0px 12px 20px 0px rgba(0, 0, 0, 0.24);
      box-shadow: 0px 20px 40px 0px rgba(0, 0, 0, 0.24);
    `,
  input: {
    error: "0px 0px 0px 2px hsla(343, 95%, 46%, 0.24)",
    focus: "0px 0px 0px 2px hsla(257, 100%, 65%, 0.24)",
  },
};
