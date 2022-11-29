import { useColorModeValue } from "@chakra-ui/color-mode";
import { useTheme } from "@chakra-ui/system";
import get from "lodash/get";
import { VictoryThemeDefinition } from "victory";

import colors from "./colors";

const shuffleEvenly = (arr: string[]): string[] => {
  const result: string[] = [];
  const piles: string[][] = [];
  const numItems = arr.length;
  const slices = 8;
  while (piles.length < slices) {
    piles.push(arr.splice(0, Math.floor(numItems / slices)));
  }
  let i = 0;
  while (i < numItems) {
    if (piles[i % slices] && piles[i % slices].length > 0) {
      result.push(piles[i % slices].pop() as string);
    }
    i += 1;
  }
  return result;
};

const COLOR_NAMES = shuffleEvenly(
  Object.entries(colors).flatMap(([key, value]) => {
    // filter out boring colors, colors used in chart UI, and colors too close to other colors
    if (
      typeof value === "string" ||
      ["gray", "purple", "red"].indexOf(key) !== -1
    ) {
      return [];
    } else if (["honeysuckle", "green"].indexOf(key) !== -1) {
      // these colors skew too bright so we only return their darker variants
      return [`${key}.500`, `${key}.800`, `${key}.700`, `${key}.600`];
    }
    return [`${key}.400`, `${key}.500`, `${key}.600`, `${key}.300`];
  })
);

export const getColorName = (id: string): string => {
  const intId = parseInt(id, 10) || 0;
  // so long as our list of colors doesn't change,
  // the object will always be assigned the same color even on reload
  return COLOR_NAMES[intId % COLOR_NAMES.length] || COLOR_NAMES[0];
};

/* customized theme from victory defaults */
const useMZVictoryTheme = (): VictoryThemeDefinition => {
  const theme = useTheme();

  const baseFill = get(
    theme,
    useColorModeValue("colors.gray.800", "colors.gray.100")
  );
  const baseStroke = get(
    theme,
    useColorModeValue("colors.gray.800", "colors.gray.200")
  );
  const lightStroke = get(
    theme,
    useColorModeValue("colors.gray.400", "colors.gray.600")
  );
  const lightFill = get(
    theme,
    useColorModeValue("colors.gray.400", "colors.gray.800")
  );

  const primaryLineStroke = get(
    theme,
    useColorModeValue("colors.purple.600", "colors.gray.200")
  );

  const flyoutBackground = get(theme, "colors.purple.800");
  const flyoutTextColor = get(theme, "colors.gray.200");

  const themeColors = Object.values(theme.colors) as string[];

  const sansSerif = theme.fonts.body as string;
  const letterSpacing = "normal";
  const fontSize = 18;
  const baseProps = {
    width: 450,
    height: 200,
    padding: { top: 15, bottom: 20, left: 25, right: 10 },
    colorScale: themeColors,
  };
  const baseLabelStyles = {
    fontFamily: sansSerif,
    fontSize,
    letterSpacing,
    padding: 5,
    fill: baseFill,
    stroke: "transparent",
  };

  const centeredLabelStyles = {
    textAnchor: "middle",
    ...baseLabelStyles,
  };
  const strokeLinecap = "round";
  const strokeLinejoin = "round";
  return {
    area: {
      style: {
        data: {
          fill: `${primaryLineStroke}33`,
          stroke: primaryLineStroke,
        },
        labels: baseLabelStyles,
      },
      ...baseProps,
    },

    axis: {
      style: {
        axis: {
          fill: "transparent",
          stroke: baseStroke,
          strokeWidth: 1,
          strokeLinecap,
          strokeLinejoin,
        },
        axisLabel: {
          ...centeredLabelStyles,
        },
        grid: {
          fill: lightStroke,
          stroke: lightStroke,
          pointerEvents: "painted",
        },
        ticks: {
          fill: "transparent",
          size: 1,
          stroke: "transparent",
        },
        tickLabels: { ...baseLabelStyles, fontSize: 12 },
      },
      ...baseProps,
    },
    bar: {
      style: {
        data: {
          fill: baseFill,
          padding: 8,
          strokeWidth: 0,
        },
        labels: baseLabelStyles,
      },
      ...baseProps,
    },

    boxplot: {
      style: {
        max: { padding: 8, stroke: baseStroke, strokeWidth: 1 },
        maxLabels: { ...baseLabelStyles, padding: 3 },
        median: { padding: 8, stroke: baseStroke, strokeWidth: 1 },
        medianLabels: { ...baseLabelStyles, padding: 3 },
        min: { padding: 8, stroke: baseStroke, strokeWidth: 1 },
        minLabels: { ...baseLabelStyles, padding: 3 },
        q1: { padding: 8, fill: lightFill },
        q1Labels: { ...baseLabelStyles, padding: 3 },
        q3: { padding: 8, fill: lightFill },
        q3Labels: { ...baseLabelStyles, padding: 3 },
      },
      boxWidth: 20,
      ...baseProps,
    },
    candlestick: {
      style: {
        data: {
          stroke: baseStroke,
          strokeWidth: 1,
        },
        labels: { ...baseLabelStyles, padding: 5 },
      },
      candleColors: {
        positive: "#ffffff",
        negative: baseStroke,
      },
      ...baseProps,
    },
    chart: baseProps,
    errorbar: {
      borderWidth: 8,
      style: {
        data: {
          fill: "transparent",
          stroke: baseStroke,
          strokeWidth: 2,
        },
        labels: baseLabelStyles,
      },
      ...baseProps,
    },
    group: baseProps,
    histogram: {
      style: {
        data: {
          fill: lightFill,
          stroke: baseStroke,
          strokeWidth: 2,
        },
        labels: baseLabelStyles,
      },
      ...baseProps,
    },

    legend: {
      colorScale: themeColors,
      gutter: 10,
      orientation: "vertical",
      titleOrientation: "top",
      style: {
        data: {
          type: "circle",
        },
        labels: baseLabelStyles,
        title: { ...baseLabelStyles, padding: 5 },
      },
    },
    line: {
      style: {
        data: {
          fill: "transparent",
          stroke: primaryLineStroke,
          strokeWidth: 2,
          strokeLinecap,
          strokeLinejoin,
        },
        labels: baseLabelStyles,
      },
      ...baseProps,
    },

    pie: {
      style: {
        data: {
          padding: 10,
          stroke: "transparent",
          strokeWidth: 1,
        },
        labels: { ...baseLabelStyles, padding: 20 },
      },
      colorScale: themeColors,
      width: 400,
      height: 400,
      padding: 50,
    },
    scatter: {
      style: {
        data: {
          fill: baseFill,
          stroke: "transparent",
          strokeWidth: 0,
        },
        labels: baseLabelStyles,
      },
      ...baseProps,
    },

    stack: baseProps,
    tooltip: {
      style: {
        ...baseLabelStyles,
        padding: 5,
        pointerEvents: "none",
        backgroundColor: "red",
      },
      flyoutStyle: {
        stroke: baseStroke,
        strokeWidth: 1,
        pointerEvents: "none",
      },
      flyoutPadding: { top: 5, left: 10, bottom: 5, right: 10 },
      cornerRadius: 5,
      pointerLength: 10,
    },
    voronoi: {
      style: {
        data: {
          fill: "transparent",
          stroke: "transparent",
          strokeWidth: 0,
        },
        labels: {
          ...baseLabelStyles,
          fill: flyoutTextColor,
          pointerEvents: "none",
          fontSize: 12,
        },
        flyout: {
          zIndex: 1000,
          stroke: "transparent",
          fill: flyoutBackground,
          pointerEvents: "none",
        },
      },
      ...baseProps,
    },
  };
};

export default useMZVictoryTheme;
