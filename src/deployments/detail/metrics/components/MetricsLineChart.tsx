import { HStack, Text, VStack } from "@chakra-ui/layout";
import { useTheme } from "@chakra-ui/system";
import React from "react";
import {
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryVoronoiContainer,
} from "victory";

import { UseRetrieveMetrics } from "../hooks";
import { mzVictoryTheme } from "../theme";
import {
  formatDatapointLabel,
  formatXToReadableDateTime,
  formatYToPercentage,
} from "../transformers";
import { DeploymentMetricsRetrieveError } from "./DeploymentMetricsRetrieveError";
import { MetricPeriodSelector } from "./MetricPeriodSelector";

export const MetricsLineChart: React.FC<UseRetrieveMetrics> = ({
  operation,
  chart,
  filters,
}) => {
  const chakraTheme = useTheme();
  return (
    <VStack spacing="3" align="left" data-testid="line-chart-container">
      {operation.error && <DeploymentMetricsRetrieveError />}
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
          theme={mzVictoryTheme(chakraTheme)}
          containerComponent={
            <VictoryVoronoiContainer labels={formatDatapointLabel} />
          }
        >
          {chart.data.map((metric) => (
            <VictoryLine interpolation="natural" data={metric.values} />
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
          />
        </VictoryChart>
      </>
    </VStack>
  );
};
