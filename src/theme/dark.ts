/**
 * @module
 * Dark theme colors.
 *
 */

import colors from "./colors";

const semanticColors = {
  accent: {
    purple: colors.purple[500],
    brightPurple: colors.purple[300],
    green: colors.green[400],
    red: colors.red[400],
  },
  foreground: {
    primary: colors.gray[50],
    secondary: colors.gray[400],
    inverse: colors.gray[900],
  },
  background: {
    primary: colors.gray[900],
    secondary: colors.gray[800],
    tertiary: colors.gray[700],
    error: colors.red[700],
    info: colors.blue[900],
    warn: colors.yellow[900],
  },
  border: {
    primary: colors.gray[700],
    secondary: colors.gray[600],
    error: colors.red[600],
    info: colors.blue[700],
    warn: colors.yellow[800],
  },
};

export const darkShadows = {
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
};

export default semanticColors;
