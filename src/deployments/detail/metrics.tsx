import { Alert, AlertIcon } from "@chakra-ui/alert";
import { useInterval } from "@chakra-ui/hooks";
import { Spacer, Text, VStack } from "@chakra-ui/layout";
import { useTheme } from "@chakra-ui/system";
import React from "react";
import {
  VictoryChart,
  VictoryLine,
  VictoryTheme,
  VictoryVoronoiContainer,
} from "victory";

import { Deployment, useDeploymentsMetricsRetrieve } from "../../api/api";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../../components/card";
import { timestampToReadableTime } from "../../utils/transformers";
import { DeploymentLogsButton } from "./deploymentLogsButton";

export interface Metric {
  name: string;
  values: [string, number][];
}

/** formatting data to be readable for display on bi-directional graph */
export const metricToVictoryCoordinates = (values: Metric["values"]) => {
  return values.map(([timestamp, value]) => {
    return { x: timestampToReadableTime(timestamp), y: value / 1_000_000 };
  });
};

export const useDeploymentMetric = (id: string) => {
  const operation = useDeploymentsMetricsRetrieve({ id });
  useInterval(operation.refetch, 5000);
  return {
    ...operation,
    data: operation.data as unknown as Metric[] | undefined,
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

export const DeploymentMetricsCard: React.FC<{ deployment: Deployment }> = ({
  deployment,
}) => {
  const { data: graphs, error } = useDeploymentMetric(deployment.id);
  const chakraTheme = useTheme();
  return (
    <Card>
      <CardHeader>Metrics</CardHeader>
      <CardContent>
        <VStack spacing="3" align="left">
          {error && <DeploymentMetricsRetrieveError />}
          {graphs && (
            <VictoryChart
              theme={VictoryTheme.material}
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
              {(graphs ?? []).map((graph) => (
                <VictoryLine
                  style={{
                    data: { stroke: chakraTheme.colors.blue[400] },
                  }}
                  data={metricToVictoryCoordinates(graph.values)}
                />
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
