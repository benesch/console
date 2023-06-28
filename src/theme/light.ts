/**
 * @module
 * Light theme colors.
 *
 */

import { ThemeColors, ThemeShadows } from ".";
import colors from "./colors";

export const lightColors: ThemeColors = {
  accent: {
    purple: colors.purple[600],
    brightPurple: colors.purple[500],
    green: colors.green[500],
    red: colors.red[500],
  },
  foreground: {
    primary: colors.gray[900],
    secondary: colors.gray[500],
    tertiary: "#949197",
    inverse: colors.gray[50],
    primaryButtonLabel: colors.white,
  },
  background: {
    primary: colors.white,
    secondary: colors.gray[50],
    tertiary: colors.gray[100],
    shellTutorial: colors.gray[100],
    error: colors.red[50],
    info: colors.blue[50],
    warn: colors.yellow[100],
    inverse: colors.gray[700],
  },
  border: {
    primary: colors.gray[200],
    secondary: colors.gray[300],
    error: colors.red[100],
    info: colors.blue[100],
    warn: colors.yellow[400],
  },
  lineGraph: [
    colors.cobalt[700],
    colors.turquoise[600],
    colors.blue[700],
    colors.yellow[700],
    colors.green[500],
  ],
};

export const lightShadows: ThemeShadows = {
  level1: `
      box-shadow: 0px 1px 1px 0px rgba(0, 0, 0, 0.04);
      box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.04);
    `,
  level2: `
      box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.08);
      box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.04);
      box-shadow: 0px 4px 9px 0px rgba(0, 0, 0, 0.04);
    `,
  level3: `
      box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.08);
      box-shadow: 0px 4px 6px 0px rgba(0, 0, 0, 0.06);
      box-shadow: 0px 6px 8px 0px rgba(0, 0, 0, 0.04);
      box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.04);
    `,
  level4: `
      box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.08);
      box-shadow: 0px 12px 20px 0px rgba(0, 0, 0, 0.08);
      box-shadow: 0px 20px 40px 0px rgba(0, 0, 0, 0.08);
    `,
  input: {
    error: "0px 0px 0px 2px hsla(343, 95%, 46%, 0.24)",
    focus: "0px 0px 0px 2px hsla(257, 100%, 65%, 0.24)",
  },
};
