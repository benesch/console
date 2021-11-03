import { WithCSSVar } from "@chakra-ui/system";
import { Dict } from "@chakra-ui/utils";

// *
// * Colors
// *

export const mzVictoryTheme = (theme: WithCSSVar<Dict<any>>) => {
  const colors = Object.values(theme.colors);
  // *
  // * Typography
  // *
  const sansSerif = "'Inter', sans-serif";
  const letterSpacing = "normal";
  const fontSize = 14;
  // *
  // * Layout
  // *
  const baseProps = {
    width: 450,
    height: 300,
    padding: 50,
    colorScale: colors,
  };
  // *
  // * Labels
  // *
  const baseLabelStyles = {
    fontFamily: sansSerif,
    fontSize,
    letterSpacing,
    padding: 5,
    fill: theme.colors.gray[800],
    stroke: "transparent",
  };

  const centeredLabelStyles = {
    textAnchor: "middle",
    ...baseLabelStyles,
  };
  // *
  // * Strokes
  // *
  const strokeLinecap = "round";
  const strokeLinejoin = "round";
  return {
    area: {
      style: {
        data: {
          fill: theme.colors.gray[800],
        },
        labels: baseLabelStyles,
      },
      ...baseProps,
    },

    axis: {
      style: {
        axis: {
          fill: "transparent",
          stroke: theme.colors.gray[800],
          strokeWidth: 1,
          strokeLinecap,
          strokeLinejoin,
        },
        axisLabel: {
          ...centeredLabelStyles,
          padding: 25,
        },
        grid: {
          fill: theme.colors.gray[400],
          stroke: theme.colors.gray[400],
          pointerEvents: "painted",
        },
        ticks: {
          fill: "transparent",
          size: 1,
          stroke: "transparent",
        },
        tickLabels: baseLabelStyles,
      },
      ...baseProps,
    },
    bar: {
      style: {
        data: {
          fill: theme.colors.gray[800],
          padding: 8,
          strokeWidth: 0,
        },
        labels: baseLabelStyles,
      },
      ...baseProps,
    },

    boxplot: {
      style: {
        max: { padding: 8, stroke: theme.colors.gray[800], strokeWidth: 1 },
        maxLabels: { ...baseLabelStyles, padding: 3 },
        median: { padding: 8, stroke: theme.colors.gray[800], strokeWidth: 1 },
        medianLabels: { ...baseLabelStyles, padding: 3 },
        min: { padding: 8, stroke: theme.colors.gray[800], strokeWidth: 1 },
        minLabels: { ...baseLabelStyles, padding: 3 },
        q1: { padding: 8, fill: theme.colors.gray[400] },
        q1Labels: { ...baseLabelStyles, padding: 3 },
        q3: { padding: 8, fill: theme.colors.gray[400] },
        q3Labels: { ...baseLabelStyles, padding: 3 },
      },
      boxWidth: 20,
      ...baseProps,
    },
    candlestick: {
      style: {
        data: {
          stroke: theme.colors.gray[800],
          strokeWidth: 1,
        },
        labels: { ...baseLabelStyles, padding: 5 },
      },
      candleColors: {
        positive: "#ffffff",
        negative: theme.colors.gray[800],
      },
      ...baseProps,
    },
    chart: baseProps,
    errorbar: {
      borderWidth: 8,
      style: {
        data: {
          fill: "transparent",
          stroke: theme.colors.gray[800],
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
          fill: theme.colors.gray[400],
          stroke: theme.colors.gray[800],
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
          stroke: theme.colors.gray[800],
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
          fill: theme.colors.gray[800],
          stroke: "transparent",
          strokeWidth: 0,
        },
        labels: baseLabelStyles,
      },
      ...baseProps,
    },

    stack: baseProps,
    tooltip: {
      style: { ...baseLabelStyles, padding: 0, pointerEvents: "none" },
      flyoutStyle: {
        stroke: theme.colors.gray[800],
        strokeWidth: 1,
        fill: "#f0f0f0",
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
        labels: { ...baseLabelStyles, padding: 5, pointerEvents: "none" },
        flyout: {
          stroke: theme.colors.gray[800],
          strokeWidth: 1,
          fill: "#f0f0f0",
          pointerEvents: "none",
        },
      },
      ...baseProps,
    },
  };
};
