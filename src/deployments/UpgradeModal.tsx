/**
 * @module
 * Deployment upgrade modal.
 */

import { ButtonProps, Text, useToast } from "@chakra-ui/react";
import React from "react";

import { Deployment, useDeploymentsPartialUpdate } from "../api/backend";
import DangerActionModal from "../components/DangerActionModal";

interface Props extends ButtonProps {
  deployment: Deployment;
  latestVersion: string;
  refetch: () => Promise<Deployment | null>;
}

const UpgradeDeploymentModal = ({
  deployment,
  latestVersion,
  refetch,
}: Props) => {
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
    <DangerActionModal
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
    </DangerActionModal>
  );
};

export default UpgradeDeploymentModal;
