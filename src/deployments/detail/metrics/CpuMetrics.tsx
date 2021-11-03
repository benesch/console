import { VStack } from "@chakra-ui/layout";
import { useTheme } from "@chakra-ui/system";
import { DateTime } from "luxon";
import React from "react";
import { VictoryAxis, VictoryChart, VictoryLine } from "victory";

import { DeploymentMetricsRetrieveError } from "./DeploymentMetricsRetrieveError";
import { useDeploymentCpuMetrics } from "./hooks";
import { MetricPeriodSelector } from "./MetricPeriodSelector";
import { mzVictoryTheme } from "./theme";
import { inferDomainFromValues } from "./transformers";

export const CpuMetrics: React.FC<{ deploymentId: string }> = ({
  deploymentId,
}) => {
  const {
    setPeriod,
    operation: { data, error },
  } = useDeploymentCpuMetrics(deploymentId);

  const chakraTheme = useTheme();

  return (
    <VStack spacing="3" align="left">
      {error && <DeploymentMetricsRetrieveError />}
      <MetricPeriodSelector onSelect={(period) => setPeriod(period)} />
      {data && (
        <VictoryChart
          scale={{ x: "time", y: "linear" }}
          domain={inferDomainFromValues(data)}
          height={250}
          theme={mzVictoryTheme(chakraTheme) as any}
        >
          {data.map((metric) => (
            <VictoryLine interpolation="natural" data={metric.values} />
          ))}
          <VictoryAxis
            standalone={false}
            tickCount={5}
            tickFormat={(x: Date) => {
              return DateTime.fromJSDate(x).toLocal().toFormat("HH:mm");
            }}
          />

          <VictoryAxis
            dependentAxis
            standalone={false}
            label="Utilization (%)"
            tickFormat={(y: number) => {
              return y * 100;
            }}
          />
        </VictoryChart>
      )}
    </VStack>
  );
};
