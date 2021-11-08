import { VStack } from "@chakra-ui/layout";
import { useTheme } from "@chakra-ui/system";
import React from "react";
import { VictoryAxis, VictoryChart, VictoryLine } from "victory";

import { formatToReadableTime } from "../../../../utils/transformers";
import { UseRetrieveMetrics } from "../hooks";
import { mzVictoryTheme } from "../theme";
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
      <MetricPeriodSelector onSelect={filters.setPeriod} />
      {chart.data && (
        <VictoryChart
          scale={{ x: "time", y: "linear" }}
          domain={chart.domains}
          theme={mzVictoryTheme(chakraTheme)}
        >
          {chart.data.map((metric) => (
            <VictoryLine interpolation="natural" data={metric.values} />
          ))}
          <VictoryAxis
            standalone={false}
            tickCount={7}
            tickFormat={formatToReadableTime}
          />
          <VictoryAxis
            dependentAxis
            standalone={false}
            label="Utilization (%)"
            tickFormat={(y: number) => {
              return Math.floor(y * 100);
            }}
          />
        </VictoryChart>
      )}
    </VStack>
  );
};
