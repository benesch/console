import { Deployment } from "../../../api/backend";

export interface DeploymentIntegrationTabProps {
  deployment: Deployment;
  refetch: () => void;
}

export interface DeploymentIntegrationCallToActionProps
  extends Pick<DeploymentIntegrationTabProps, "refetch"> {
  id: string;
  enabled: boolean;
}
