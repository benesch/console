import { useDisclosure } from "@chakra-ui/hooks";
import { useToast } from "@chakra-ui/toast";
import { useEffect, useState } from "react";

import {
  PatchedDeploymentUpdateRequest,
  useDeploymentsPartialUpdate,
} from "../../../../api/api";
import { useDeployment } from "../../DeploymentProvider";

export type TailscaleIntegrationForm = Pick<
  PatchedDeploymentUpdateRequest,
  "enableTailscale" | "tailscaleAuthKey"
>;

export const useTailscaleConfigurationForm = () => {
  const toast = useToast();
  const modalState = useDisclosure();
  const { partialUpdateOperation, retrieveOperation, deployment } =
    useDeployment();

  const defaultTailscaleAuthKeyValue = deployment?.enableTailscale ? "***" : "";

  const save = async (form: TailscaleIntegrationForm) => {
    await partialUpdateOperation.mutate({
      ...form,
      enableTailscale: true,
    });
    await retrieveOperation.refetch();
    toast({
      title: "Integration has been saved successfully",
      status: "success",
    });
    modalState.onClose();
  };
  return {
    defaultValues: {
      tailscaleAuthKey: defaultTailscaleAuthKeyValue,
    },
    modalState,
    save,
    operation: partialUpdateOperation,
  };
};

export const useDisableIntegration = () => {
  const toast = useToast();
  const { retrieveOperation, partialUpdateOperation, deployment } =
    useDeployment();
  const disableIntegration = async () => {
    await partialUpdateOperation.mutate({
      enableTailscale: false,
      tailscaleAuthKey: undefined,
    });
    toast({ title: "The integration has been disabled", status: "success" });
    return retrieveOperation.refetch();
  };

  return {
    operation: partialUpdateOperation,
    disableIntegration,
  };
};
