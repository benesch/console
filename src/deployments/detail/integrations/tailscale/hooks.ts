import { useFormikContext } from "formik";
import { useEffect, useState } from "react";

import {
  Deployment,
  DeploymentsPartialUpdateProps,
  PatchedDeploymentUpdateRequest,
} from "../../../../api/api";
import { useDeployment } from "../../DeploymentProvider";

export type TailscaleIntegrationForm = Pick<
  PatchedDeploymentUpdateRequest,
  "enableTailscale" | "tailscaleAuthKey"
>;
export const useTailscaleIntegration = () => {
  const { retrieveOperation, partialUpdateOperation, deployment } =
    useDeployment();

  const defaultTailscaleAuthKeyValue = deployment?.enableTailscale ? "***" : "";
  const savePreferences = async (parameters: any) => {
    await partialUpdateOperation.mutate(parameters);
    return retrieveOperation.refetch();
  };
  return {
    defaultValues: {
      enableTailscale: deployment?.enableTailscale ?? false,
      tailscaleAuthKey: defaultTailscaleAuthKeyValue,
    },
    savePreferences,
  };
};

export const useComputedFields = () => {
  const { values } = useFormikContext<TailscaleIntegrationForm>();

  return {
    shouldShowAdditionalFields: values.enableTailscale,
    shouldDisabledTailscaleAuthKey: !values.enableTailscale,
  };
};
