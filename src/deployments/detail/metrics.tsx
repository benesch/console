import { Alert, AlertIcon } from "@chakra-ui/alert";
import { useInterval } from "@chakra-ui/hooks";
import { HStack, Spacer, Text, VStack } from "@chakra-ui/layout";
import { Select } from "@chakra-ui/select";
import { useTheme } from "@chakra-ui/system";
import React, { useEffect } from "react";
import {
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryTheme,
  VictoryVoronoiContainer,
} from "victory";

import {
  Deployment,
  PrometheusMetric,
  useDeploymentsMetricsMemoryRetrieve,
} from "../../api/api";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../../components/card";
import { timestampToReadableTime } from "../../utils/transformers";
import { DeploymentLogsButton } from "./deploymentLogsButton";

/** formatting data to be readable for display on bi-directional graph */
export const metricToVictoryCoordinates = (
  values: PrometheusMetric["values"]
) => {
  return values.map(([timestamp, value]) => {
    return {
      x: timestampToReadableTime(parseFloat(timestamp)),
      y: parseFloat(value) / 1_000_000,
    };
  });
};

export const useDeploymentMetric = (id: string) => {
  const [period, setPeriod] = React.useState<number>(5);
  const operation = useDeploymentsMetricsMemoryRetrieve({ id, period });
  useInterval(operation.refetch, 5000);

  useEffect(() => {
    operation.refetch();
  }, [period]);

  return {
    operation,
    setPeriod,
  };
};

export const DeploymentMetricsRetrieveError = () => {
  return (
    <Alert
      status="error"
      p={1}
      px={2}
      data-testid="fetch-deployment-issue-alert"
    >
      <AlertIcon />
      <Text>Failed to load metrics for this deployment</Text>
    </Alert>
  );
};

export const MetricPeriodSelector = (props: {
  onSelect: (period: number) => void;
}) => (
  <HStack>
    <Text>last&nbsp;</Text>
    <Select onChange={(e) => props.onSelect(parseInt(e.target.value))}>
      <option value={5}>5 minutes</option>
      <option value={15}>15 minutes</option>
      <option value={30}>30 minutes</option>
      <option value={60}>hour</option>
      <option value={60}>2 hours</option>
    </Select>
  </HStack>
);

export const DeploymentMetricsCard: React.FC<{ deployment: Deployment }> = ({
  deployment,
}) => {
  const {
    setPeriod,
    operation: { data, error },
  } = useDeploymentMetric(deployment.id);
  const chakraTheme = useTheme();
  return (
    <Card>
      <CardHeader>Metrics</CardHeader>
      <CardContent>
        <VStack spacing="3" align="left">
          {error && <DeploymentMetricsRetrieveError />}
          <MetricPeriodSelector onSelect={(period) => setPeriod(period)} />
          {data && (
            <VictoryChart
              height={200}
              padding={{ top: 50, bottom: 50, left: 50, right: 50 }}
              containerComponent={
                <VictoryVoronoiContainer
                  labels={({ datum }: { datum: { x: string; y: number } }) =>
                    `${datum.x}, ${datum.y}`
                  }
                />
              }
            >
              {(data.metrics ?? []).map((metric) => (
                <>
                  <VictoryLine
                    style={{
                      data: { stroke: chakraTheme.colors.blue[400] },
                    }}
                    data={metricToVictoryCoordinates(metric.values)}
                  />
                  {/* <VictoryAxis
                    tickValues={metric.values.map(([timestamp]) => timestamp)}
                    tickFormat={(t: any) => `${Math.round(t)}k`}
                  /> */}
                </>
              ))}
            </VictoryChart>
          )}
        </VStack>
      </CardContent>
      <CardFooter>
        <Spacer />
        <DeploymentLogsButton deployment={deployment} size="sm" />
      </CardFooter>
    </Card>
  );
};
