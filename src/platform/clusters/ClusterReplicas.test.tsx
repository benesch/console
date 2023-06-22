import { screen } from "@testing-library/react";
import React from "react";
import { Route, Routes } from "react-router-dom";

import { ErrorCode } from "~/api/materialize/types";
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

const ClusterReplicasWithRoute = () => (
  <Routes>
    <Route path=":id/:clusterName" element={<ClusterReplicas />} />
  </Routes>
);

const useClusterReplicasWithUtilizationColumns = [
  "id",
  "replica_name",
  "cluster_name",
  "cluster_id",
  "size",
  "cpu_percent",
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
    renderComponent(<ClusterReplicasWithRoute />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      initialRouterEntries: ["/u2/cluster_1"],
    });

    expect(await screen.findByTestId("loading-spinner")).toBeVisible();
  });

  it("shows an error state if results fail to load", async () => {
    server.use(
      buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: useClusterReplicasWithUtilizationColumns,
        rows: [],
        error: {
          message: "Something went wrong",
          code: ErrorCode.INTERNAL_ERROR,
        },
      })
    );
    renderComponent(<ClusterReplicasWithRoute />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      initialRouterEntries: ["/u2/cluster_1"],
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
    renderComponent(<ClusterReplicasWithRoute />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      initialRouterEntries: ["/u2/cluster_1"],
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
        rows: [
          [
            "test_id",
            "test_replica",
            "test_cluster",
            "test_cluster_id",
            "2xsmall",
            18.0015698,
            6.836938858032227,
          ],
        ],
      })
    );
    renderComponent(<ClusterReplicasWithRoute />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      initialRouterEntries: ["/u2/cluster_1"],
    });

    expect(await screen.findByText("test_replica")).toBeVisible();
    expect(await screen.findByText("2xsmall")).toBeVisible();
    expect(await screen.findByText("18.0")).toBeVisible();
    expect(await screen.findByText("6.8")).toBeVisible();
  });
});
