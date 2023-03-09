import { fireEvent, screen, waitFor } from "@testing-library/react";
import { mockFlags, resetLDMocks } from "jest-launchdarkly-mock";
import { rest } from "msw";
import React from "react";

import server from "~/api/mocks/server";
import { renderComponent } from "~/test/utils";

import SwitchStackModal from "./SwitchStackModal";

describe("SwitchStackModal", () => {
  beforeEach(() => {
    resetLDMocks();

    Object.defineProperty(window, "location", {
      writable: true,
      value: { assign: jest.fn() },
    });
    window.location.hostname = "localhost";
  });

  describe("when the feature flag is disabled", () => {
    it("renders nothing", () => {
      mockFlags({ "switch-stacks-modal": false });
      const result = renderComponent(<SwitchStackModal />);

      expect(result.container).toBeEmptyDOMElement();
    });
  });

  describe("when the feature flag is enabled", () => {
    beforeEach(() => {
      mockFlags({ "switch-stacks-modal": true });
    });

    it("shows the switch stack button", () => {
      const result = renderComponent(<SwitchStackModal />);

      expect(result.getByText("Switch stack")).toBeVisible();
    });

    it("shows the current stack", async () => {
      const result = renderComponent(<SwitchStackModal />);

      fireEvent.click(result.getByText("Switch stack"));
      await waitFor(() =>
        expect(screen.getByText("Current Stack: test")).toBeVisible()
      );
    });

    it("shows stack options", async () => {
      const result = renderComponent(<SwitchStackModal />);

      fireEvent.click(result.getByText("Switch stack"));
      await waitFor(() =>
        expect(screen.getByText("Current Stack: test")).toBeVisible()
      );
      expect(screen.getByText("Staging")).toBeVisible();
      expect(screen.getByText("Local")).toBeVisible();
      expect(screen.getByText("Personal")).toBeVisible();
      // Production doesn't show up on localhost, since it won't work
      expect(screen.queryByText("Production")).not.toBeInTheDocument();
    });

    it("does not show production option on staging", async () => {
      window.location.hostname = "staging.console.materialize.com";
      const result = renderComponent(<SwitchStackModal />);

      fireEvent.click(result.getByText("Switch stack"));
      await waitFor(() =>
        expect(screen.getByText("Current Stack: staging")).toBeVisible()
      );
      expect(screen.getByLabelText("Staging")).toBeVisible();
      expect(screen.queryByText("Production")).not.toBeInTheDocument();
    });

    it("shows the production stack on production urls", async () => {
      window.location.hostname = "console.materialize.com";
      const result = renderComponent(<SwitchStackModal />);

      fireEvent.click(result.getByText("Switch stack"));
      await waitFor(() =>
        expect(screen.getByText("Current Stack: test")).toBeVisible()
      );
      expect(screen.getByLabelText("Production")).toBeVisible();
    });

    it("shows and error message for invalid personal stacks", async () => {
      server.use(
        rest.get(
          "https://admin.fake.dev.cloud.materialize.com/*",
          (_req, res) => {
            return res.networkError("address not found");
          }
        )
      );
      const result = renderComponent(<SwitchStackModal />);

      fireEvent.click(result.getByText("Switch stack"));
      await waitFor(() =>
        expect(screen.getByText("Current Stack: test")).toBeVisible()
      );
      fireEvent.change(result.getByPlaceholderText("$USER.$ENV"), {
        target: {
          value: "fake.dev",
        },
      });
      fireEvent.click(result.getByText("Switch"));
      expect(
        await result.findByText(
          "https://admin.fake.dev.cloud.materialize.com is not reachable from this origin."
        )
      ).toBeVisible();
    });

    it("switches to valid personal stack", async () => {
      location.reload = jest.fn();
      server.use(
        rest.get(
          "https://admin.someuser.dev.cloud.materialize.com/*",
          (_req, res, ctx) => {
            return res(ctx.status(200));
          }
        )
      );
      const result = renderComponent(<SwitchStackModal />);

      fireEvent.click(result.getByText("Switch stack"));
      await waitFor(() =>
        expect(screen.getByText("Current Stack: test")).toBeVisible()
      );
      fireEvent.change(result.getByPlaceholderText("$USER.$ENV"), {
        target: {
          value: "someuser.dev",
        },
      });
      fireEvent.click(result.getByText("Switch"));
      await waitFor(() => {
        expect(window.localStorage.getItem("mz-current-stack")).toEqual(
          "someuser.dev"
        );
      });
      expect(location.reload).toHaveBeenCalled();
    });
  });
});
