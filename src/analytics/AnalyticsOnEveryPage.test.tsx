import { useAuth } from "@frontegg/react";
import { render, waitFor } from "@testing-library/react";
import { createMemoryHistory } from "history";
import React from "react";
import { Router } from "react-router";

import { globalConfigStub } from "../__mocks__/config";
import { GlobalConfig } from "../config";
import AnalyticsOnEveryPage from "./AnalyticsOnEveryPage";
import { AnalyticsClient } from "./types";

export class ShimAnalyticsClient extends AnalyticsClient {
  constructor(config: GlobalConfig) {
    super(config);
  }
  page = jest.fn();
  identify = jest.fn();
  reset = jest.fn();
}

export const makeShimAnalyticsClient = () => {
  const instance = new ShimAnalyticsClient(globalConfigStub);
  instance.page.mockClear();
  return instance;
};

const setupRenderTree = ({
  passAnalyticsClient = true,
}: { passAnalyticsClient?: boolean } = {}) => {
  const history = createMemoryHistory();

  const shimAnalyticsClients = [
    makeShimAnalyticsClient(),
    makeShimAnalyticsClient(),
  ];

  const params = passAnalyticsClient ? { clients: shimAnalyticsClients } : {};

  const wrapper = render(
    <Router history={history}>
      <AnalyticsOnEveryPage {...params} />
    </Router>
  );

  return {
    history,
    shimAnalyticsClients,
    wrapper,
  };
};

jest.mock("@frontegg/react", () => ({
  useAuth: jest.fn(() => ({ user: { id: "123" } })),
}));

describe("analytics/AnalyticsOnEveryPage", () => {
  it("should emit an analytics `page` event when the router's location changes for every provided analytics client", async () => {
    const {
      shimAnalyticsClients: [client1, client2],
      history,
    } = setupRenderTree();
    // initial page

    history.push("/somewhere");

    // So we have a component without any kind of returned node,
    // so testing library is not helpful, as it cannot target a "visible element"
    // we use wait for as an escape hatch to "retry" the condition until it succeeds or a predefined timer expires
    // the page event is called twice, once at page load and once at page change
    await waitFor(() => expect(client1.page).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(client2.page).toHaveBeenCalledTimes(2));
  });
  it("should do nothing if no analytics client are provided", async () => {
    const {
      shimAnalyticsClients: [client1, client2],
      history,
    } = setupRenderTree({
      passAnalyticsClient: false,
    });

    history.push("/somewhere");
    const client1SentEventAnotherTime = await waitFor(
      () => (client1.page as jest.Mock).mock.calls.length > 1
    );

    const client2SentEventAnotherTime = await waitFor(
      () => (client2.page as jest.Mock).mock.calls.length > 1
    );
    expect(client1SentEventAnotherTime).toBe(false);
    expect(client2SentEventAnotherTime).toBe(false);
  });

  it("should identify the user if valid auth is available", () => {
    const {
      shimAnalyticsClients: [client],
    } = setupRenderTree();
    expect(client.identify).toHaveBeenCalledTimes(2);
    expect(client.identify).toHaveBeenCalledWith("123");
  });

  it("should reset user tracking if authentication is not valid anymore", () => {
    (useAuth as jest.Mock).mockImplementationOnce(() => ({ user: null }));
    const {
      shimAnalyticsClients: [client],
    } = setupRenderTree();
    expect(client.reset).toHaveBeenCalledTimes(1);
  });
});
