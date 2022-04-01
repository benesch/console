import { HStack, Text, VStack } from "@chakra-ui/layout";
import { useTheme } from "@chakra-ui/system";
import React from "react";
import {
  VictoryArea,
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryVoronoiContainer,
} from "victory";

import useMZVictoryTheme, { getColorName } from "../../../theme/victoryChart";
import { Domains } from "../domains";
import {
  formatDatapointLabel,
  formatXToReadableDateTime,
  formatYToPercentage,
} from "../transformers";
import { VictoryMetric } from "../types";
import MetricPeriodSelector from "./MetricPeriodSelector";
import DeploymentMetricsRetrieveError from "./MetricsRetrieveError";

export type Chart = {
  data: VictoryMetric[];
  domains: Domains;
  ticks: number[];
};

export type ChartProps = {
  chart: Chart;
  filters: {
    period: number;
    setPeriod: (period: number) => void;
  };
  errorMessage: string | null;
  testId: string;
  useLines?: boolean;
};

const MetricsLineChart: React.FC<ChartProps> = ({
  chart,
  filters,
  errorMessage,
  testId,
  useLines,
}) => {
  const chartContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = React.useState(400);
  const chartTheme = useMZVictoryTheme();
  const theme = useTheme();

  const getChartWidth = () => {
    if (chartContainerRef.current) {
      setWidth(chartContainerRef.current.clientWidth);
    }
  };

  React.useEffect(() => {
    getChartWidth();
    window.addEventListener("resize", getChartWidth);
  }, []);

  return (
    <VStack
      align="left"
      data-testid="line-chart-container"
      sx={{ svg: { overflow: "visible" } }}
    >
      {errorMessage && (
        <DeploymentMetricsRetrieveError
          errorMessage={errorMessage}
          testId={testId}
        />
      )}
      <HStack
        justifyContent="space-between"
        alignItems="flex-end"
        px={3}
        pl={0}
        ref={chartContainerRef}
      >
        <Text>Utilization (%)</Text>
        <MetricPeriodSelector
          period={filters.period}
          onSelect={filters.setPeriod}
        />
      </HStack>
      <VictoryChart
        scale={{ x: "time", y: "linear" }}
        domain={chart.domains}
        theme={chartTheme}
        containerComponent={
          <VictoryVoronoiContainer
            labels={formatDatapointLabel}
            voronoiBlacklist={["overuseLine", "overuseFill"]}
            responsive={false}
          />
        }
        height={250}
        width={width}
      >
        {chart.domains.y[1] > 1 && (
          <VictoryArea
            name="overuseFill"
            style={{ data: { fill: `${theme.colors.red[400]}22` } }}
            data={[
              { x: chart.domains.x[0], y: chart.domains.y[1], y0: 1 },
              { x: chart.domains.x[1], y: chart.domains.y[1], y0: 1 },
            ]}
          />
        )}
        {chart.data &&
          chart.data.map((metric) => {
            if (useLines) {
              return (
                <VictoryLine
                  key={metric.name}
                  interpolation="linear"
                  style={{
                    data: {
                      opacity: 0.9,
                      stroke: `var(--ck-colors-${getColorName(
                        metric.name
                      ).replace(".", "-")})`,
                    },
                  }}
                  data={[
                    ...metric.values,
                    {
                      ...metric.values[metric.values.length - 1],
                      x: chart.domains.x[1],
                    },
                  ]}
                />
              );
            }
            return (
              <VictoryArea
                key={metric.name}
                interpolation="linear"
                data={[
                  ...metric.values,
                  {
                    ...metric.values[metric.values.length - 1],
                    x: chart.domains.x[1],
                  },
                ]}
              />
            );
          })}
        <VictoryAxis
          standalone={false}
          tickCount={4}
          tickFormat={formatXToReadableDateTime(filters.period)}
        />
        <VictoryAxis
          dependentAxis
          standalone={false}
          tickFormat={formatYToPercentage}
          tickValues={chart.ticks}
        />
        {chart.domains.y[1] > 1 && (
          <VictoryLine
            name="overuseLine"
            style={{
              data: {
                stroke: theme.colors.red[500],
                strokeDasharray: "6 12",
                strokeWidth: 3,
              },
            }}
            data={[
              { x: chart.domains.x[0], y: 1 },
              { x: chart.domains.x[1], y: 1 },
            ]}
          />
        )}
      </VictoryChart>
    </VStack>
  );
};

export default MetricsLineChart;
