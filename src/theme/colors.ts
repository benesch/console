const colors = {
  transparent: "transparent",
  trueBlack: "#000",
  black: "#111",
  white: "#FFF",
  offWhite: "#f9f9f9",
  // true grayscale
  bwGray: {
    50: "#fef0f9",
    100: "#ded7d9",
    200: "#c2bebf",
    300: "#a7a5a6",
    400: "#8c8c8c", // for b&w logo
    500: "#737373",
    600: "#5a5959",
    700: "#423f40",
    800: "#2a2526",
    900: "#17080d",
  },
  // "gray" with a slight bit of blue-purple in it
  gray: {
    50: "#efeffe",
    100: "#d2d3e4",
    200: "#b5b6cb",
    300: "#9899b5",
    400: "#8182A3",
    500: "#616285",
    600: "#4b4c68",
    700: "#36364c",
    800: "#26263a",
    900: "#1f2130",
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
  divider: {
    light: colors.gray[100],
    dark: colors.gray[800],
  },
  card: {
    bg: {
      light: colors.white,
      dark: "#000000aa",
    },
    border: {
      light: "transparent",
      dark: colors.gray[700],
    },
  },
  dropdown: {
    bg: {
      dark: colors.gray[700],
      light: colors.gray[100],
    },
  },
};

const shadows = {
  footer: "0 -2px 1px #0000000d",
  glowDark: `
    0px 100px 117px rgb(80 26 251 / 16%),
    0px 42px 49px rgb(80 26 251 / 12%),
    0px 22px 26px rgb(80 26 251 / 10%),
    0px 12px 15px rgb(80 26 251 / 8%),
    0px 7px 8px rgb(80 26 251 / 6%),
    0px 3px 3.25px rgb(80 26 251 / 4%),
    0px -7px 8px rgb(80 26 251 / 6%),
    0px -3px 3.25px rgb(80 26 251 / 4%)
  `,
  glowLight: `
    0px 14px 16px rgb(80 26 251 / 8%),
    0px 7px 9px rgb(80 26 251 / 6%),
    0px 3px 4px rgb(80 26 251 / 4%),
    0px -3px 3.25px rgb(80 26 251 / 4%)
  `,
  smallGlowDark: `
    0px 12px 15px rgb(80 26 251 / 8%),
    0px 7px 8px rgb(80 26 251 / 6%),
    0px 3px 3.25px rgb(80 26 251 / 4%),
    0px -7px 8px rgb(80 26 251 / 6%),
    0px -3px 3.25px rgb(80 26 251 / 4%)
  `,
};

export default colors;

export { gradients, semanticColors, shadows };
