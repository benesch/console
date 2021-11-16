import { useDeploymentsRetrieve } from "../../api/api";
import { useDeploymentHook } from "./DeploymentProvider";

jest.mock("../../api/api", () => ({
  useDeploymentsRetrieve: jest.fn(() => ({
    data: undefined,
    loading: false,
  })),
}));

describe("DeploymentProvider", () => {
  describe("hook", () => {
    it("should return the current deployment from the api response data", () => {
      const deployment = { id: "123" };
      (useDeploymentsRetrieve as jest.Mock).mockImplementationOnce(() => ({
        data: deployment,
        loading: false,
      }));

      const deploymentHook = useDeploymentHook();
      expect(deploymentHook.deployment).toEqual(deployment);
      expect(deploymentHook.retrieveOperation).toBeDefined();
    });

    it("should return the id of the deployment", () => {
      expect(useDeploymentHook("1").id).toEqual("1");
    });
  });
});
