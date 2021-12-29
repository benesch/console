import { Text } from "@chakra-ui/layout";
import * as React from "react";

const IntegrationStatus: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const integrationText = enabled ? "" : "not";
  return <Text>The integration is {integrationText} enabled.</Text>;
};

export default IntegrationStatus;
