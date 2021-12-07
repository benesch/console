import { waitFor } from "@testing-library/dom";
import { screen } from "@testing-library/react";
import { Response } from "miragejs";
import * as React from "react";

import {
  ApiLayerMock,
  createApiLayerMock,
  receivedRequestsBodyFromMock,
} from "../../../../api/__mocks__/api";
import { renderFragmentInTestMode } from "../../../../utils/tests-utils";
import { DisableTailscale } from "./DisableTailscale";

const toastMock = jest.fn();
jest.mock("@chakra-ui/toast", () => {
  return {
    useToast: () => toastMock,
  };
});

const renderComponent = (enabled: boolean) => {
  const refetch = jest.fn();
  const fragment = renderFragmentInTestMode(
    <DisableTailscale id="123" enabled={enabled} refetch={refetch} />
  );

  return {
    fragment,
    refetch,
  };
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
      renderComponent(false);
      await expect(selectors.disableButton()).rejects.toBeDefined();
    });
  });

  describe("Confirmation popover modal", () => {
    it("clicking on disable should prompt confirmation via a popover", async () => {
      renderComponent(true);
      const disableButton = await selectors.disableButton();
      disableButton.click();
      await waitFor(() => expect(selectors.disablePopover()).toBeDefined());

      expect(apiMock?.handlers.partialUpdateHandler).not.toHaveBeenCalled();
    });
    it("confirming in the popover should update the integration via API", async () => {
      renderComponent(true);
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
    it("should signal the API error via a toast to the user", async () => {
      apiMock?.handlers.partialUpdateHandler.mockImplementationOnce(() => {
        return new Response(500, {}, {});
      });
      renderComponent(true);
      (await selectors.disableButton()).click();
      (await selectors.disablePopoverConfirmationButton()).click();

      await waitFor(() => {
        expect(toastMock).toHaveBeenCalledWith({
          title: `Failed to disable the integration`,
          description: "Failed to fetch: 500 Internal Server Error",
          status: "error",
        });
      });
    });
  });
});
