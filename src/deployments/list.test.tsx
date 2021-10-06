import { mockUseAuth } from "../api/__mocks__/auth";
mockUseAuth();

import { render, screen } from "@testing-library/react";
import { Response } from "miragejs";
import React from "react";
import { MemoryRouter } from "react-router";
import { RestfulProvider } from "restful-react";

import {
  ApiLayerMock,
  createApiLayerMock,
  testApiBase,
} from "../api/__mocks__/api";
import { validDeployment } from "./__mocks__";
import { DeploymentListPage } from "./list";

export const renderDeploymentList = () => {
  return render(
    <MemoryRouter>
      <RestfulProvider base={testApiBase}>
        <DeploymentListPage />
      </RestfulProvider>
    </MemoryRouter>
  );
};

const selectors = {
  loading: () => screen.findByTestId("loading-spinner"),
  deployment: () => screen.findByText(validDeployment.name),
  deploymentFetchAlert: () =>
    screen.findByTestId("fetch-deployment-issue-alert"),
};

describe("deployments/list", () => {
  jest.useFakeTimers();
  let apiMock: ApiLayerMock | undefined;

  beforeEach(() => {
    apiMock = createApiLayerMock();
  });
  afterEach(() => {
    apiMock?.server.shutdown();
  });

  it("should fetch the deployment as soon as the component renders", async () => {
    renderDeploymentList();
    expect(await selectors.loading()).toBeDefined();
    expect(await selectors.deployment()).toBeDefined();
  });

  it("should refetch deployment every 5 seconds", async () => {
    renderDeploymentList();
    await selectors.deployment();
    expect(apiMock?.handlers.getApiDeployementsHandler).toHaveBeenCalledTimes(
      1
    );

    // after 5 seconds, we should refetch
    jest.advanceTimersByTime(6000);
    expect(apiMock?.handlers.getApiDeployementsHandler).toHaveBeenCalledTimes(
      2
    );
  });

  it("should display a warning alert the deployments api return an error", async () => {
    apiMock?.server.get("/api/deployments", () => new Response(500, {}, {}));
    renderDeploymentList();
    expect(await selectors.deploymentFetchAlert()).toBeDefined();
  });

  it("should return a previously cached version if the api returns an error", async () => {
    // first initial fetch is okay
    renderDeploymentList();
    await selectors.deployment();

    // from now on this api is in error
    apiMock?.server.get("/api/deployments", () => new Response(500, {}, {}));
    jest.advanceTimersByTime(6000);

    expect(await selectors.deployment()).toBeDefined();
  });
});
