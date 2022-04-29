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

import useMZVictoryTheme from "../../../theme/victoryChart";
import { UseRetrieveMetrics } from "../hooks";
import {
  formatDatapointLabel,
  formatXToReadableDateTime,
  formatYToPercentage,
} from "../transformers";
import MetricPeriodSelector from "./MetricPeriodSelector";
import DeploymentMetricsRetrieveError from "./MetricsRetrieveError";

type Props = UseRetrieveMetrics & { testId: string; errorMessage: string };

const MetricsLineChart: React.FC<Props> = ({
  operation,
  chart,
  filters,
  errorMessage,
  testId,
}) => {
  const chartTheme = useMZVictoryTheme();
  const theme = useTheme();

  return (
    <VStack
      align="left"
      data-testid="line-chart-container"
      sx={{ svg: { overflow: "visible" } }}
    >
      {operation.error && (
        <DeploymentMetricsRetrieveError
          errorMessage={errorMessage}
          testId={testId}
        />
      )}
      <>
        <HStack
          justifyContent="space-between"
          alignItems="flex-end"
          px={3}
          pl={0}
        >
          <Text>Utilization (%)</Text>
          <MetricPeriodSelector onSelect={filters.setPeriod} />
        </HStack>
        <VictoryChart
          scale={{ x: "time", y: "linear" }}
          domain={chart.domains}
          theme={chartTheme}
          containerComponent={
            <VictoryVoronoiContainer
              labels={formatDatapointLabel}
              voronoiBlacklist={["overuseLine", "overuseFill"]}
            />
          }
        >
          {chart.domains.y[1] > 1 && (
            <VictoryLine
              name="overuseLine"
              style={{
                data: {
                  stroke: theme.colors.red[400],
                  strokeDasharray: 4,
                },
              }}
              data={[
                { x: chart.domains.x[0], y: 1 },
                { x: chart.domains.x[1], y: 1 },
              ]}
            />
          )}
          {chart.domains.y[1] > 1 && (
            <VictoryArea
              name="overuseFill"
              style={{ data: { fill: `${theme.colors.red[400]}55` } }}
              data={[
                { x: chart.domains.x[0], y: chart.domains.y[1], y0: 1 },
                { x: chart.domains.x[1], y: chart.domains.y[1], y0: 1 },
              ]}
            />
          )}
          {chart.data.map((metric) => (
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
          ))}
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
        </VictoryChart>
      </>
    </VStack>
  );
};

export default MetricsLineChart;
