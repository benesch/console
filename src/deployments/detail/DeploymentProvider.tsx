import { createContainer } from "unstated-next";

import {
  useDeploymentsPartialUpdate,
  useDeploymentsRetrieve,
} from "../../api/api";

/** A hook that manage the lifecycle of an existing deployment
 * As react-restful does not provide caching features, we share the retrieve hook result to prevent duplicated data fetching
 */
export const useDeploymentHook = (id = "") => {
  const retrieveOperation = useDeploymentsRetrieve({ id });
  const partialUpdateOperation = useDeploymentsPartialUpdate({ id });
  return {
    id,
    deployment: retrieveOperation.data,
    retrieveOperation,
    partialUpdateOperation,
  };
};
const DeploymentContainer = createContainer(useDeploymentHook);

export const useDeployment = () => DeploymentContainer.useContainer();
export const DeploymentProvider = DeploymentContainer.Provider;
