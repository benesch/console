import { VStack } from "@chakra-ui/layout";
import React from "react";

import { Deployment, useDeploymentsMetricsRetrieve } from "../../api/api";
import { Card, CardContent, CardHeader } from "../../components/card";

export const useDeploymentMetric = (id: string) => {
  const operation = useDeploymentsMetricsRetrieve({ id });

  return operation;
};

export const DeploymentMetricsCard: React.FC<{ deployment: Deployment }> = ({
  deployment,
}) => {
  const { loading, data } = useDeploymentMetric(deployment.id);

  console.log(loading, data);

  if (loading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>Details</CardHeader>
      <CardContent>
        <VStack spacing="3" align="left">
          <pre>{JSON.stringify(data ?? {}, null, 2)}</pre>;
        </VStack>
      </CardContent>
      {/* <CardFooter>
        <Spacer />
        <DeploymentLogsButton deployment={deployment} size="sm" />
      </CardFooter> */}
    </Card>
  );
};
