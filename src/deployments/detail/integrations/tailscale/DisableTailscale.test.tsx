import { waitFor } from "@testing-library/dom";
import { screen } from "@testing-library/react";
import * as React from "react";

import {
  ApiLayerMock,
  createApiLayerMock,
  receivedRequestsBodyFromMock,
} from "../../../../api/__mocks__/api";
import { renderFragmentInTestMode } from "../../../../utils/tests-utils";
import { validDeploymentWithTailscale } from "../../../__mocks__";
import { useDeployment } from "../../DeploymentProvider";
import { DisableTailscale } from "./DisableTailscale";

jest.mock("../../DeploymentProvider", () => ({
  useDeployment: jest.fn(),
}));

const renderComponent = () => renderFragmentInTestMode(<DisableTailscale />);

const contexts = {
  useDeploymentWithIntegrationEnabled: () => {
    (useDeployment as jest.Mock).mockReturnValue({
      deployment: validDeploymentWithTailscale,
      refetch: jest.fn(),
    });
  },
};

const selectors = {
  disableButton: async () => (await screen.findAllByText("Disable"))[0],
  disablePopover: () =>
    document.querySelector("[data-testid=confirm-action-popover]"),
  disablePopoverConfirmationButton: () => screen.findByText("Yes"),
};

describe("DisableTailscale", () => {
  let apiMock: ApiLayerMock | undefined;

  beforeEach(() => {
    apiMock = createApiLayerMock();
  });
  afterEach(() => {
    apiMock?.server.shutdown();
  });

  describe("Disable Button ", () => {
    it("should be visible when the deployment has the integration enabled", async () => {
      contexts.useDeploymentWithIntegrationEnabled();
      renderComponent();
      expect(await selectors.disableButton()).toBeDefined();
    });
  });

  describe("Confirmation popover modal", () => {
    it("clicking on disable should prompt confirmation via a popover", async () => {
      contexts.useDeploymentWithIntegrationEnabled();
      renderComponent();
      const disableButton = await selectors.disableButton();
      disableButton.click();
      await waitFor(() => expect(selectors.disablePopover()).toBeDefined());

      expect(apiMock?.handlers.partialUpdateHandler).not.toHaveBeenCalled();
    });
    it("confirming in the popover should update the integration via API", async () => {
      contexts.useDeploymentWithIntegrationEnabled();
      renderComponent();
      (await selectors.disableButton()).click();
      (await selectors.disablePopoverConfirmationButton()).click();
      await waitFor(() => {
        const requestBodies = receivedRequestsBodyFromMock(
          apiMock?.handlers.partialUpdateHandler
        );
        if (requestBodies.length) {
          return expect(requestBodies[0].enableTailscale).toBeFalsy();
        }
      });
    });
  });
});
