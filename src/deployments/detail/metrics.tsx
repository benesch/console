import { Alert, AlertIcon } from "@chakra-ui/alert";
import { Spacer, Text, VStack } from "@chakra-ui/layout";
import React from "react";

import { Deployment, useDeploymentsMetricsRetrieve } from "../../api/api";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../../components/card";

export const useDeploymentMetric = (id: string) => {
  const operation = useDeploymentsMetricsRetrieve({ id });
  return operation;
};

/*
<VictoryChart
          theme={VictoryTheme.material}
          height={200}
          padding={{ top: 10, left: 40, right: 15, bottom: 40 }}
        >
          {data.data.result.map((result) => (
            <VictoryLine
              style={{
                data: { stroke: chakraTheme.colors.blue[400] },
              }}
              data={result.values.map((value) => ({
                x: Number(value[0]),
                y: Number(value[1]),
              }))}
            />
          ))}
        </VictoryChart>
*/

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
  const { loading, data, error } = useDeploymentMetric(deployment.id);
  console.log(loading, data);
  if (loading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>Metrics</CardHeader>
      <CardContent>
        <VStack spacing="3" align="left">
          {error && <DeploymentMetricsRetrieveError />}
          <pre>{JSON.stringify(data ?? {}, null, 2)}</pre>;
        </VStack>
      </CardContent>
      <CardFooter>
        <Spacer />
        {/* <DeploymentLogsButton deployment={deployment} size="sm" /> */}
      </CardFooter>
    </Card>
  );
};
