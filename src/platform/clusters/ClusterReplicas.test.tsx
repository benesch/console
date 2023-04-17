import { screen } from "@testing-library/react";
import React from "react";

import { buildUseSqlQueryHandler } from "~/api/mocks/buildSqlQueryHandler";
import server from "~/api/mocks/server";
import {
  healthyEnvironment,
  renderComponent,
  setFakeEnvironment,
} from "~/test/utils";

import ClusterReplicas from "./ClusterReplicas";
import { CLUSTERS_FETCH_ERROR_MESSAGE } from "./constants";

jest.mock("~/api/auth");

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn().mockReturnValue({ id: 1, clusterName: "test_cluster" }),
}));

const useClusterReplicasWithUtilizationColumns = [
  "id",
  "replica_name",
  "cluster_id",
  "size",
  "memory_percent",
];

describe("ClusterReplicas", () => {
  it("shows a spinner initially", async () => {
    server.use(
      buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: useClusterReplicasWithUtilizationColumns,
        rows: [],
      })
    );
    renderComponent(<ClusterReplicas />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
    });

    expect(await screen.findByTestId("loading-spinner")).toBeVisible();
  });

  it("shows an error state if results fail to load", async () => {
    server.use(
      buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: useClusterReplicasWithUtilizationColumns,
        rows: [],
        error: "Something went wrong",
      })
    );
    renderComponent(<ClusterReplicas />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
    });

    expect(await screen.findByText(CLUSTERS_FETCH_ERROR_MESSAGE)).toBeVisible();
  });

  it("shows the empty state when there are no results", async () => {
    server.use(
      buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: useClusterReplicasWithUtilizationColumns,
        rows: [],
      })
    );
    renderComponent(<ClusterReplicas />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
    });

    expect(
      await screen.findByText("This cluster has no replicas")
    ).toBeVisible();
  });

  it("renders the cluster replicas list", async () => {
    server.use(
      buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: useClusterReplicasWithUtilizationColumns,
        rows: [["test_id", "test_replica", "test_cluster_id", "2xsmall", 5]],
      })
    );
    renderComponent(<ClusterReplicas />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
    });

    expect(await screen.findByText("test_replica")).toBeVisible();
    expect(await screen.findByText("2xsmall")).toBeVisible();
    expect(await screen.findByText("5.0")).toBeVisible();
  });
});
