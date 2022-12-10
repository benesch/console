/**
 * @module
 * Light theme colors.
 *
 */

import colors from "./colors";

const semanticColors = {
  accent: {
    purple: colors.purple[600],
    brightPurple: colors.purple[400],
    green: colors.green[500],
  },
  foreground: {
    primary: colors.gray[900],
    secondary: colors.gray[500],
    inverse: colors.gray[50],
  },
  background: {
    primary: colors.white,
    secondary: colors.gray[50],
    tertiary: colors.gray[200],
    error: colors.red[50],
    info: colors.blue[50],
    warn: colors.yellow[100],
  },
  border: {
    primary: colors.gray[200],
    secondary: colors.gray[400],
    error: colors.red[100],
    info: colors.blue[100],
    warn: colors.yellow[400],
  },
};

export const lightShadows = {
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
};

export default semanticColors;
