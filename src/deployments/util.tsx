/**
 * @module
 * Reusable deployment-specific components.
 */

import { Alert, AlertDescription, Badge } from "@chakra-ui/react";
import React from "react";

import { Deployment } from "../api/api";
import { useAuth } from "../api/auth";
import { SupportLink } from "../components/cta";
import { SelectField } from "../components/form";

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

export function DeploymentSizeField() {
  const { organization } = useAuth();
  const disabled = !!organization?.trialExpiresAt;
  return (
    <>
      <SelectField name="size" label="Size" size="sm">
        <option value="XS">Extra small</option>
        <option value="S">Small</option>
        <option value="M" disabled={disabled}>
          Medium
        </option>
        <option value="L" disabled={disabled}>
          Large
        </option>
        <option value="XL" disabled={disabled}>
          Extra large
        </option>
      </SelectField>
      <Alert status="info">
        <AlertDescription fontSize="sm">
          Need a larger size? <SupportLink>Contact us.</SupportLink>
        </AlertDescription>
      </Alert>
    </>
  );
}
