/**
 * @module
 * Deployment upgrade modal.
 */

import { ButtonProps, Text, useToast } from "@chakra-ui/react";
import React from "react";

import { Deployment, useDeploymentsPartialUpdate } from "../api/api";
import { ConfirmModal } from "../components/modal";

interface UpgradeDeploymentButtonProps extends ButtonProps {
  deployment: Deployment;
  latestVersion: string;
  refetch: () => Promise<void>;
}

export function UpgradeDeploymentButton({
  deployment,
  latestVersion,
  refetch,
}: UpgradeDeploymentButtonProps) {
  const { mutate: updateDeployment } = useDeploymentsPartialUpdate({
    id: deployment.id,
  });
  const toast = useToast();

  const handleUpgrade = async () => {
    updateDeployment({ mzVersion: latestVersion });
    await refetch();
    toast({
      title: "Deployment queued for upgrade.",
    });
  };

  return (
    <ConfirmModal
      title="Upgrade deployment"
      actionText="Upgrade"
      colorScheme="blue"
      confirmText={deployment.name}
      onConfirm={handleUpgrade}
      size="sm"
    >
      <Text fontSize="sm">
        <strong>Are you sure?</strong> Upgrading this deployment to{" "}
        <strong>{latestVersion}</strong> will require a restart.
      </Text>
    </ConfirmModal>
  );
}
