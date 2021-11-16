import { screen } from "@testing-library/react";
import * as React from "react";

import {
  ApiLayerMock,
  createApiLayerMock,
} from "../../../../api/__mocks__/api";
import { renderFragmentInTestMode } from "../../../../utils/tests-utils";
import { DeploymentProvider } from "../../DeploymentProvider";
import { EnableEditTailscaleConfiguration } from "./EnableEditTailscaleConfiguration";

const renderComponent = () =>
  renderFragmentInTestMode(
    <DeploymentProvider id="1">
      <EnableEditTailscaleConfiguration />
    </DeploymentProvider>
  );

const selectors = {
  enableButton: () => screen.findByText("Enable"),
  editButton: () => screen.findByText("Edit"),
  configurationModal: () =>
    screen.findByTestId("tailscale-configuration-modal"),
  modalSaveButton: () => screen.findByText("Save"),
  disableButton: () => screen.findByText("Edit"),
};

describe("EnableEditTailscaleConfiguration", () => {
  jest.useFakeTimers();
  let apiMock: ApiLayerMock | undefined;

  beforeEach(() => {
    apiMock = createApiLayerMock();
  });
  afterEach(() => {
    apiMock?.server.shutdown();
  });

  describe("Enable", () => {
    it("should display Enable if the integration is not enabled", async () => {
      renderComponent();
      expect(await selectors.enableButton()).toBeDefined();
    });
    it("should display the creation modal on the button click", async () => {
      renderComponent();
      const enableButton = await selectors.enableButton();
      enableButton.click();
      expect(await selectors.configurationModal()).toBeDefined();
    });
    it("submitting the creation modal form should activate the integration", () => {});
  });

  describe("Edit", () => {
    it("should display Edit if the integration is currently enabled", () => {});
    it("should display an obsfucated auth key in the edit modal", () => {});
    it("should update the integration upon submitting the edit modal", () => {});
  });
});
