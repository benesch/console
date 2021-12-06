import {
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/dom";
import { screen } from "@testing-library/react";
import * as React from "react";

import {
  ApiLayerMock,
  createApiLayerMock,
  receivedRequestsBodyFromMock,
} from "../../../../api/__mocks__/api";
import { renderFragmentInTestMode } from "../../../../utils/tests-utils";
import { EnableEditTailscaleConfiguration } from "./EnableEditTailscaleConfiguration";

const renderComponent = (enabled = true) => {
  const refetch = jest.fn();
  return renderFragmentInTestMode(
    <EnableEditTailscaleConfiguration
      id="123"
      refetch={refetch}
      enabled={enabled}
    />
  );
};

const selectors = {
  enableButton: () => screen.findByText("Enable"),
  editButton: () => screen.findByText("Edit"),
  configurationModal: () =>
    screen.findByTestId("tailscale-configuration-modal"),
  tailscaleAuthKeyInput: () =>
    document.querySelector("[name=tailscaleAuthKey]"),
  modalSaveButton: () => screen.findByText("Save"),
  disableButton: () => screen.findByText("Edit"),
};

describe("EnableEditTailscaleConfiguration", () => {
  let apiMock: ApiLayerMock | undefined;

  beforeEach(() => {
    apiMock = createApiLayerMock();
  });
  afterEach(() => {
    apiMock?.server.shutdown();
  });

  describe("Enable Button", () => {
    it("should display Enable if the integration is not enabled", async () => {
      renderComponent(false);
      expect(await selectors.enableButton()).toBeDefined();
    });
    it("should display the creation modal on the button click", async () => {
      renderComponent(false);
      const enableButton = await selectors.enableButton();
      enableButton.click();
      expect(await selectors.configurationModal()).toBeDefined();
    });
  });

  describe("Edit Button", () => {
    it("should display Edit if the integration is currently enabled", async () => {
      renderComponent();
      expect(await selectors.editButton()).toBeDefined();
    });
    it("should display the edition modal modal on the button click", async () => {
      renderComponent();
      const editButton = await selectors.editButton();
      editButton.click();
      expect(await selectors.configurationModal()).toBeDefined();
    });
    it("should display an obsfucated auth key in the edit modal", async () => {
      renderComponent();
      const editButton = await selectors.editButton();
      editButton.click();
      await selectors.configurationModal();
      // the modal is rendered in a portal, thus we can't use `screen` to query the rendered tree.
      // we use an escape hatch to query the DOM directly.
      const input =
        selectors.tailscaleAuthKeyInput() as HTMLInputElement | null;
      expect(input?.value).toBe("***");
    });
  });

  describe("Configuration modal", () => {
    it("submit should save the deployment with the tailscale auth key", async () => {
      // setup
      renderComponent(false);
      const enableButton = await selectors.enableButton();
      enableButton.click();
      await selectors.configurationModal();

      // act
      const tailscaleAuthKeyInput = selectors.tailscaleAuthKeyInput();
      if (!tailscaleAuthKeyInput)
        throw new Error("tailscaleAuthKeyInput not found");

      fireEvent.change(tailscaleAuthKeyInput, { target: { value: "secret" } });

      const modalSaveButton = await selectors.modalSaveButton();
      modalSaveButton.click();

      await waitFor(() => {
        // detecting the request body is a bit tricky, we should certainly abstract that a function
        // requestBody is a string by default
        const requestBodies = receivedRequestsBodyFromMock(
          apiMock?.handlers.partialUpdateHandler
        );
        if (requestBodies.length) {
          // so we scan for the "secret"
          return expect(requestBodies[0].secret).toBeDefined();
        }
      });
    });
  });
});
