const colors = {
  transparent: "transparent",
  trueBlack: "#000",
  black: "#111",
  /**
   * Light / Background Primary
   * AND
   * Light / Text Inverse
   */
  white: "#FFF",
  offWhite: "#f9f9f9",
  gray: {
    /**
     * Light / Background Secondary
     * AND
     * Dark / Text Inverse
     */
    50: "#F7F7F8",
    /**
     * Light / Background Tertiary
     */
    100: "#F1F1F3",
    /**
     * Light / Border Primary
     */
    200: "#EAE9EC",
    /**
     * Light / Border Secondary
     */
    300: "#E0DEE3",
    /**
     * Light / Border Secondary
     */
    400: "#BCB9C0",
    /**
     * Light / Text Secondary
     */
    500: "#726E77",
    /**
     * Dark / Border Secondary
     */
    600: "#3D3B40",
    /**
     * Dark / Border Primary
     * AND
     * Dark / Background Tertiary
     */
    700: "#323135",
    /**
     * Dark / Background Secondary
     */
    800: "#232225",
    /**
     * Light / Text Primary
     * AND
     * Dark / Background Primary
     */
    900: "#0D1116",
  },
  purple: {
    50: "#f1ecff",
    100: "#E1D6FF",
    200: "#C8B5FF",
    300: "#B59AFF",
    400: "#7F4EFF", // purple, purple buttons
    500: "#5A34CB", // Primary Materialize Purple
    600: "#472F85", // med-purple
    700: "#391D7E",
    800: "#1B164C", // dark-purple
    900: "#040126", // header bar bg
  },
  // nb: our regular purple is much closer to true "lavender"
  // but that's what the style doc calls it :P
  lavender: {
    50: "#fbe6ff",
    100: "#e6bafa",
    200: "#d28df2",
    300: "#bf60eb",
    400: "#AE37E5", // highlight
    500: "#931acb",
    600: "#7e148f",
    700: "#530d73",
    800: "#320647",
    900: "#1f002c",
  },
  orchid: {
    50: "#ffe5fd",
    100: "#f9b9ed",
    200: "#E37AC2",
    300: "#eb60ce",
    400: "#E537C0", // highlight
    500: "#cb1aa6",
    600: "#9f1381",
    700: "#720b5d",
    800: "#460439",
    900: "#2e0225",
  },
  red: {
    50: "#ffe2ee",
    100: "#ffb1c9",
    200: "#ff7fa5",
    300: "#ff4d82",
    400: "#fe1d5e",
    500: "#e50644",
    600: "#af0034",
    700: "#810026",
    800: "#4f0016",
    900: "#35000f",
  },
  orange: {
    50: "#ffeadf",
    100: "#ffc6b1",
    200: "#FF9067", // used in gradient, closest to highlight color
    300: "#fe7e4e",
    400: "#fe581d",
    500: "#e54004",
    600: "#b23101",
    700: "#802200",
    800: "#4e1400",
    900: "#3a0f01",
  },
  yellow: {
    50: "#fefff5",
    100: "#fdfee2",
    200: "#fcfdc9",
    300: "#fafba7",
    400: "#f7f97b",
    500: "#f5f754",
    600: "#dde00a",
    700: "#c5c809",
    800: "#a3a608",
    900: "#737505",
  },
  honeysuckle: {
    50: "#f6ffdc",
    100: "#eaffaf",
    200: "#deff7f",
    300: "#CBFF38", // highlight
    400: "#bbf320",
    500: "#a2da08",
    600: "#84b300",
    700: "#5e8000",
    800: "#384d00",
    900: "#243100",
  },
  green: {
    50: "#dfffe4",
    100: "#b1ffba",
    200: "#75FF86",
    300: "#4fff63",
    400: "#13D461", // highlight
    500: "#07a44a",
    600: "#008a3f",
    700: "#007535",
    800: "#00471d",
    900: "#002e13",
  },
  turquoise: {
    50: "#dbfffe",
    100: "#b5f7f3",
    200: "#8befea",
    300: "#61e8e0",
    400: "#39E1D7", // light button outline
    500: "#1ec7bd",
    600: "#0d9b93",
    700: "#007069",
    800: "#004340",
    900: "#00312f",
  },
  blue: {
    50: "#d9f8ff",
    100: "#ace4ff",
    200: "#7bd1ff",
    300: "#59C3FF",
    400: "#1EAEFF", // highlight
    500: "#0093e6",
    600: "#0072b4",
    700: "#005282",
    800: "#014166",
    900: "#003151",
  },
  cobalt: {
    50: "#e3e5ff",
    100: "#b3b8ff",
    200: "#979eff",
    300: "#7d86ff",
    400: "#4f5af5",
    500: "#221EFF", // highlight
    600: "#0000b4",
    700: "#000082",
    800: "#000050",
    900: "#000021",
  },
  indigo: {
    50: "#eee6ff",
    100: "#c8b6ff",
    200: "#a487f9",
    300: "#7f57f5",
    400: "#5C29F1", // for a gradient, too blue for the other purples
    500: "#4512C7",
    600: "#320aa9",
    700: "#25038a",
    800: "#15044b",
    900: "#020025",
  },
};

const gradients = {
  primary: {
    gradient: [
      `radial-gradient(
        88.57% 72.27% at 6.45% 137.95%,
        #9B34CB 0%,
        #9b34cb00 100%
      )`,
      `radial-gradient(
        81.76% 69.63% at 75.55% 107.58%,
        ${colors.purple[500]} 0%,
        #4334cb00 100%
      )`,
    ],
    fallback: colors.indigo[900],
  },
  accentDark1: {
    gradient: `linear-gradient(
      280.8deg,
      ${colors.indigo[400]} 15.21%,
      ${colors.orchid[300]} 56.5%,
      ${colors.orange[300]} 85.53%
    )`,
    fallback: colors.lavender[400],
    animation: {
      backgroundPosition: "0% 100%",
      backgroundSize: "200% 200%",
      transition: "background-position 0.2s ease-out",
      ":hover": {
        backgroundPosition: "80% 100%",
      },
      ":active": {
        backgroundPosition: "100% 100%",
      },
    },
  },
  accentDark1Text: {
    gradient: `linear-gradient(
      280.8deg,
      ${colors.purple[400]} 15.21%,
      ${colors.orchid[200]} 56.5%,
      ${colors.orange[200]} 85.53%
    )`,
    fallback: colors.orange[200],
  },
  accentDark2: {
    gradient: `linear-gradient(
      319.14deg,
      ${colors.purple[500]} 10.84%,
      #B634CB 82.13%
    )`,
    fallback: colors.purple[500],
    animation: {
      backgroundPosition: "0% 100%",
      backgroundSize: "300% 300%",
      transition: "background-position 0.3s ease-out",
      ":hover": {
        backgroundPosition: "100% 100%",
      },
    },
  },
  accentLight1: {
    gradient: `linear-gradient(
      282.62deg,
      ${colors.indigo[500]} 1.14%,
      ${colors.blue[400]} 49.24%,
      ${colors.green[400]} 93.87%
    )`,
    fallback: colors.indigo[500],
  },
  accentLight1Text: {
    gradient: `linear-gradient(
      277.43deg,
      ${colors.indigo[500]} 20%,
      ${colors.blue[500]},
      ${colors.green[600]} 85%
    )`,
    fallback: colors.indigo[500],
  },
  accentLight2: {
    gradient: `linear-gradient(
      277.43deg,
      ${colors.indigo[500]} -97.28%,
      ${colors.blue[300]} 15.82%,
      ${colors.green[200]} 120.75%
    )`,
    fallback: colors.blue[300],
  },
};

const semanticColors = {
  bg: {
    light: colors.white,
    dark: colors.gray[900],
  },
  divider: {
    light: colors.gray[100],
    dark: colors.gray[700],
  },
  card: {
    bg: {
      light: colors.white,
      dark: colors.gray[900],
    },
    border: {
      light: colors.gray[100],
      dark: colors.gray[700],
    },
  },
  dropdown: {
    bg: {
      dark: colors.gray[700],
      light: colors.white,
    },
  },
  grayText: {
    light: colors.gray[500],
    dark: colors.gray[200],
  },
};

const shadows = {
  light: {
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
  },
  dark: {
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
  },
  footer: "0 -2px 1px #0000000d",
};

export default colors;

export { gradients, semanticColors, shadows };
