import { Badge } from "@chakra-ui/react";
import React from "react";

import { Deployment } from "../api/backend";

interface Props {
  deployment: Deployment;
}

/** A badge that displays the human-readable status of a deployment. */
const DeploymentStateBadge = ({ deployment }: Props) => {
  if (deployment.flaggedForDeletion) {
    return <Badge colorScheme="orange">Destroying</Badge>;
  }
  if (deployment.flaggedForUpdate) {
    return <Badge colorScheme="yellow">Updating</Badge>;
  }
  if (deployment.status === "OK" && deployment.disableUserIndexes) {
    return (
      <Badge
        colorScheme="blue"
        title="Deployment is healthy, but user indexes are disabled. Use this mode to troubleshoot your Materialize deployment."
      >
        User Indexes Disabled
      </Badge>
    );
  }
  if (deployment.status === "OK" && deployment.catalogRestoreMode) {
    return (
      <Badge
        colorScheme="blue"
        title="Deployment is restoring from a catalog backup."
      >
        Restoring From Catalog Backup
      </Badge>
    );
  }
  switch (deployment.status) {
    case "OK":
      return <Badge colorScheme="green">Healthy</Badge>;
    case "WAITING_FOR_DNS":
      return <Badge colorScheme="yellow">Waiting for DNS</Badge>;
    case "STARTING":
      return <Badge colorScheme="yellow">Starting</Badge>;
    case "DAMAGED":
      return <Badge colorScheme="red">Degraded</Badge>;
    default:
      return <Badge colorScheme="red">Unknown</Badge>;
  }
};

export default DeploymentStateBadge;
