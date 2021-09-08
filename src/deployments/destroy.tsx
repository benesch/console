/**
 * @module
 * Deployment destruction modal.
 */

import { DeleteIcon } from "@chakra-ui/icons";
import { ButtonProps, Text, useToast } from "@chakra-ui/react";
import React from "react";
import { useHistory } from "react-router";

import { Deployment, useDeploymentsDestroy } from "../api/api";
import { ConfirmModal } from "../components/modal";
import { sleep } from "../util";

interface DestroyDeploymentButtonProps extends ButtonProps {
  deployment: Deployment;
}

export function DestroyDeploymentButton(props: DestroyDeploymentButtonProps) {
  const history = useHistory();
  const { mutate: destroyDeployment } = useDeploymentsDestroy({});
  const toast = useToast();

  const handleDelete = async () => {
    await destroyDeployment(props.deployment.id);
    // Sleeping here work around a Safari bug in which the previous deployment
    // destroy request is incorrectly throws an AbortError:
    // https://bugs.webkit.org/show_bug.cgi?id=215771
    await sleep(100);
    toast({
      title: "Deployment queued for deletion.",
      status: "error",
    });
    history.push("/deployments");
  };

  return (
    <ConfirmModal
      title="Destroy deployment"
      colorScheme="red"
      confirmIcon={<DeleteIcon />}
      actionText="Destroy"
      confirmText={props.deployment.name}
      onConfirm={handleDelete}
      size="sm"
    >
      <Text fontSize="sm">
        <strong>Are you sure?</strong> Destroying this deployment is
        irreversible.
      </Text>
    </ConfirmModal>
  );
}
