/**
 * @module
 * Reusable deployment-specific components.
 */

import { Badge } from "@chakra-ui/react";
import React from "react";

import { Deployment } from "../api/api";

export interface DeploymentStateBadgeProps {
  deployment: Deployment;
}

/** A badge that displays the human-readable status of a deployment. */
export function DeploymentStateBadge({
  deployment,
}: DeploymentStateBadgeProps) {
  if (deployment.flaggedForDeletion) {
    return <Badge colorScheme="yellow">Destroying</Badge>;
  }
  if (deployment.flaggedForUpdate) {
    return <Badge colorScheme="yellow">Updating</Badge>;
  }
  switch (deployment.status) {
    case "OK":
      return <Badge colorScheme="green">Healthy</Badge>;
    case "STARTING":
      return <Badge colorScheme="yellow">Starting</Badge>;
    case "DAMAGED":
      return <Badge colorScheme="red">Degraded</Badge>;
    default:
      return <Badge colorScheme="red">Unknown</Badge>;
  }
}
