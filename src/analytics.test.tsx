import Analytics from "@segment/analytics.js-core/build/analytics";
import { render, waitFor } from "@testing-library/react";
import { createMemoryHistory } from "history";
import React from "react";
import { Router } from "react-router";

import {
  analyticsClient,
  AnalyticsOnEveryPage,
  buildAnalyticsClient,
  initAnalytics,
} from "./analytics";

jest.mock("@segment/analytics.js-integration-segmentio", () => ({}));
jest.mock("@segment/analytics.js-core/build/analytics", () => {
  class AnalyticsMock {
    initialize = jest.fn();
    use = jest.fn();
    page = jest.fn();
  }
  return AnalyticsMock;
});

// We will most likely be able to reuse some of that that for future tests
const setupRenderTree = ({
  passAnalyticsClient = true,
}: { passAnalyticsClient?: boolean } = {}) => {
  const history = createMemoryHistory();

  const shimAnalyticsClient: Analytics = {
    initialize: jest.fn(),
    page: jest.fn(),
    use: jest.fn(),
  };

  const wrapper = render(
    <Router history={history}>
      <AnalyticsOnEveryPage
        analytics={passAnalyticsClient ? shimAnalyticsClient : undefined}
      />
    </Router>
  );

  return {
    history,
    shimAnalyticsClient,
    wrapper,
  };
};

describe("analytics", () => {
  describe("buildAnalyticsClient", () => {
    it("should build an Analytics object, configure it and return the instance", () => {
      const o = buildAnalyticsClient("some-key");
      // first argument of first call
      expect((o.initialize as jest.Mock).mock.calls[0][0]).toMatchObject({
        "Segment.io": {
          apiKey: "some-key",
        },
      });
      // we send an analytics event at least once:
      expect(o.page).toHaveBeenCalledTimes(1);
      expect(o.use).toHaveBeenCalledWith({});
    });
  });
  describe("initAnalytics", () => {
    it("should build the analytics client instance exposed by the module if the segment api key exists", () => {
      expect(analyticsClient).not.toBeDefined();

      initAnalytics({
        segmentApiKey: null,
        fronteggUrl: "some-url",
        sentryDsn: null,
        sentryEnvironment: null,
        sentryRelease: null,
      });

      expect(analyticsClient).not.toBeDefined();

      initAnalytics({
        segmentApiKey: "api-key",
        fronteggUrl: "some-url",
        sentryDsn: null,
        sentryEnvironment: null,
        sentryRelease: null,
      });
      expect(analyticsClient).toBeDefined();
    });
  });

  describe("AnalyticsOnEveryPage", () => {
    it("should emit an analytics `page` event when the router's location changes", async () => {
      // as we start to have more tests, we will abstract this initialization code
      // something like testInContext that accepts a react fragement tends to work well

      const { shimAnalyticsClient, history } = setupRenderTree();
      expect(shimAnalyticsClient.page).toHaveBeenCalledTimes(1);
      history.push("/somewhere");

      //So we have a component without any kind of returned node,
      // so testing library is not helpful, as it cannot target a "visible element"
      // we use wait for as an escape hatch to "retry" the condition until it succeeds or a predefined timer expires
      await waitFor(() =>
        expect(shimAnalyticsClient.page).toHaveBeenCalledTimes(2)
      );
    });
    it("should do nothing if the analytics client is not set", async () => {
      const { shimAnalyticsClient, history } = setupRenderTree({
        passAnalyticsClient: false,
      });

      expect(shimAnalyticsClient.page).toHaveBeenCalledTimes(0);
      history.push("/somewhere");
      const wasCalled = await waitFor(
        () => (shimAnalyticsClient.page as jest.Mock).mock.calls.length > 0
      );
      expect(wasCalled).toBe(false);
    });
  });
});
