import { useDisclosure } from "@chakra-ui/hooks";
import { useToast } from "@chakra-ui/toast";

import {
  PatchedDeploymentUpdateRequest,
  useDeploymentsPartialUpdate,
} from "../../../../api/backend";
import { DeploymentIntegrationCallToActionProps } from "../types";

export type TailscaleIntegrationForm = Pick<
  PatchedDeploymentUpdateRequest,
  "enableTailscale" | "tailscaleAuthKey"
>;

export const useTailscaleIntegration = ({
  id,
  enabled,
  refetch,
}: DeploymentIntegrationCallToActionProps) => {
  const toast = useToast();
  const modalState = useDisclosure();

  const partialUpdateOperation = useDeploymentsPartialUpdate({ id });

  const defaultTailscaleAuthKeyValue = enabled ? "***" : "";

  const save = async (form: TailscaleIntegrationForm) => {
    await partialUpdateOperation.mutate({
      ...form,
      enableTailscale: true,
    });

    await refetch();

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

export const useDisableIntegration = ({
  id,
  refetch,
}: DeploymentIntegrationCallToActionProps) => {
  const toast = useToast();
  const partialUpdateOperation = useDeploymentsPartialUpdate({ id });
  const disableIntegration = (closePopup: () => void) => async () => {
    try {
      await partialUpdateOperation.mutate({
        enableTailscale: false,
        tailscaleAuthKey: undefined,
      } as any);
      toast({ title: "The integration has been disabled", status: "success" });
      return refetch();
    } catch (error) {
      toast({
        title: `Failed to disable the Tailscale integration`,
        status: "error",
      });
    } finally {
      closePopup();
    }
  };

  return {
    operation: partialUpdateOperation,
    disableIntegration,
  };
};
