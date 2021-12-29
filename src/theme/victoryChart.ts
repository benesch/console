import { useColorModeValue } from "@chakra-ui/color-mode";
import { useTheme } from "@chakra-ui/system";
import get from "lodash/get";
import { VictoryThemeDefinition } from "victory";

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

  const colors = Object.values(theme.colors) as string[];

  const sansSerif = theme.fonts.body as string;
  const letterSpacing = "normal";
  const fontSize = 12;
  const baseProps = {
    width: 450,
    height: 200,
    padding: { top: 15, bottom: 20, left: 25, right: 10 },
    colorScale: colors,
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
        tickLabels: { ...baseLabelStyles, fontSize: 10 },
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
      colorScale: colors,
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
      colorScale: colors,
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
        padding: 0,
        pointerEvents: "none",
        backgroundColor: "red",
      },
      flyoutStyle: {
        stroke: baseStroke,
        strokeWidth: 1,
        pointerEvents: "none",
      },
      flyoutPadding: 5,
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
          fontSize: 11,
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
