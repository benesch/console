import { useDeploymentsPartialUpdate } from "../../../../api/api";
import { useDeployment } from "../../DeploymentProvider";
import { useTailscaleIntegration } from "./hooks";

jest.mock("../../../../api/api", () => ({
  useDeploymentsPartialUpdate: jest.fn(() => {}),
}));
jest.mock("../../DeploymentProvider", () => ({
  useDeployment: jest.fn(),
}));

jest.mock("@chakra-ui/toast", () => ({
  useToast: jest.fn(),
}));

jest.mock("@chakra-ui/hooks", () => ({
  useDisclosure: jest.fn(() => ({
    onOpen: jest.fn(),
    onClose: jest.fn(),
  })),
}));

describe("integrations/tailscale", () => {
  describe("hooks", () => {
    describe("useTailscaleIntegration", () => {
      describe("defaultValues", () => {
        it("defaultTailscaleAuthKeyValue should be obsfucated if the current api response indicates that the integration is enabled", () => {
          (useDeployment as jest.Mock).mockReturnValue({
            id: "1",
            deployment: { enableTailscale: true },
          });

          expect(
            useTailscaleIntegration().defaultValues.tailscaleAuthKey
          ).toEqual("***");
        });
      });

      describe("save", () => {
        it("should update the deployment via api with the tailscale api and refetch the deployment to get the most up to date version", () => {});
        it("should close the modal", () => {});
        it("should show a toast with a success message", () => {});
      });

      describe("operation", () => {
        it("should return the state of the deployment update", () => {});
      });
    });

    describe("useDisableIntegration", () => {
      describe("disableIntegration", () => {
        it("disableIntegration should update the deployment via api and set enableTailscale to false", () => {});
        it("should refetch the current deployment", () => {});
        it("should show a success toast the current deployment", () => {});
      });

      describe("operation", () => {});
    });
  });
});
