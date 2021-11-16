import { Text } from "@chakra-ui/layout";
import * as React from "react";

import { useDeployment } from "../../DeploymentProvider";

export const IntegrationStatus: React.FC = (props) => {
  const { deployment } = useDeployment();
  const integrationText = deployment?.enableTailscale ? "" : "not";
  return <Text>The integration is {integrationText} enabled</Text>;
};
