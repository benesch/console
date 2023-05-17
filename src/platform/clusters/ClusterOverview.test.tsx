import { screen } from "@testing-library/react";
import React from "react";

import { ErrorCode } from "~/api/materialize/types";
import { ClustersProvider } from "~/api/materialize/useClusters";
import useClusterUtilization from "~/api/materialize/useClusterUtilization";
import { buildUseSqlQueryHandler } from "~/api/mocks/buildSqlQueryHandler";
import server from "~/api/mocks/server";
import {
  healthyEnvironment,
  renderComponent,
  setFakeEnvironment,
} from "~/test/utils";

import ClusterOverview from "./ClusterOverview";
import { CLUSTERS_FETCH_ERROR_MESSAGE } from "./constants";

jest.mock("~/api/auth");

jest.mock("~/api/materialize/useClusterUtilization", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const ClusterOverviewWithProviders = () => (
  <ClustersProvider>
    <ClusterOverview />
  </ClustersProvider>
);

describe("ClusterOverview", () => {
  afterEach(() => {
    (useClusterUtilization as jest.Mock).mockReset();
  });

  it("shows a spinner initially", async () => {
    (useClusterUtilization as jest.Mock).mockReturnValue({
      data: [],
      errors: [],
      isStale: false,
    });

    renderComponent(<ClusterOverviewWithProviders />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
    });

    expect(await screen.findByTestId("loading-spinner")).toBeVisible();
  });

  it("shows an error state when cluster utilization websocket fails", async () => {
    (useClusterUtilization as jest.Mock).mockReturnValue({
      data: null,
      errors: ["error 1"],
      isStale: false,
    });
    renderComponent(<ClusterOverviewWithProviders />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
    });

    expect(await screen.findByText(CLUSTERS_FETCH_ERROR_MESSAGE)).toBeVisible();
  });

  it("shows an error state when cluster replicas fail to load", async () => {
    (useClusterUtilization as jest.Mock).mockReturnValue({
      data: [],
      errors: [],
      isStale: false,
    });

    server.use(
      buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: ["id", "cluster_name", "replica_id", "replica_name", "size"],
        rows: [],
        error: {
          message: "Something went wrong",
          code: ErrorCode.INTERNAL_ERROR,
        },
      })
    );

    renderComponent(<ClusterOverviewWithProviders />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
    });

    expect(await screen.findByText(CLUSTERS_FETCH_ERROR_MESSAGE)).toBeVisible();
  });
});
