import { render, waitFor } from "@testing-library/react";
import { createMemoryHistory } from "history";
import React from "react";
import { Router } from "react-router";

import { GlobalConfig } from "../types";
import { AnalyticsOnEveryPage } from ".";
import { globalConfigStub } from "./__mocks__";
import { AnalyticsClient } from "./types";

export class ShimAnalyticsClient extends AnalyticsClient {
  constructor(config: GlobalConfig) {
    super(config);
  }
  page = jest.fn(() => console.log("called"));
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

  const wrapper = render(
    <Router history={history}>
      <AnalyticsOnEveryPage
        clients={passAnalyticsClient ? shimAnalyticsClients : []}
      />
    </Router>
  );

  return {
    history,
    shimAnalyticsClients,
    wrapper,
  };
};

describe("analytics/AnalyticsOnEveryPage", () => {
  it("should emit an analytics `page` event when the router's location changes for every provided analytics client", async () => {
    const {
      shimAnalyticsClients: [client1, client2],
      history,
    } = setupRenderTree();
    history.push("/somewhere");

    //So we have a component without any kind of returned node,
    // so testing library is not helpful, as it cannot target a "visible element"
    // we use wait for as an escape hatch to "retry" the condition until it succeeds or a predefined timer expires
    await waitFor(() => expect(client1.page).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(client2.page).toHaveBeenCalledTimes(1));
  });
  it("should do nothing if no analytics client are provided", async () => {
    const {
      shimAnalyticsClients: [client1, client2],
      history,
    } = setupRenderTree({
      passAnalyticsClient: false,
    });

    expect(client1.page).toHaveBeenCalledTimes(0);
    expect(client2.page).toHaveBeenCalledTimes(0);

    history.push("/somewhere");
    const client1Emitted = await waitFor(
      () => (client1.page as jest.Mock).mock.calls.length > 0
    );

    const client2Emitted = await waitFor(
      () => (client2.page as jest.Mock).mock.calls.length > 0
    );
    expect(client1Emitted).toBe(false);
    expect(client2Emitted).toBe(false);
  });
});
