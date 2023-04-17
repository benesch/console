import { screen } from "@testing-library/react";
import React from "react";
import { Route, Routes } from "react-router-dom";

import { buildUseSqlQueryHandler } from "~/api/mocks/buildSqlQueryHandler";
import server from "~/api/mocks/server";
import {
  healthyEnvironment,
  renderComponent,
  setFakeEnvironment,
} from "~/test/utils";

import { CLUSTERS_FETCH_ERROR_MESSAGE } from "./constants";
import MaterializedViews from "./MaterializedViews";

jest.mock("~/api/auth");

const MaterializedViewsWithRoute = () => (
  <Routes>
    <Route path=":id" element={<MaterializedViews />} />
  </Routes>
);

const useMaterializedViewsColumns = ["id", "name", "definition"];

describe("MaterializedViews", () => {
  it("shows a spinner initially", async () => {
    renderComponent(<MaterializedViewsWithRoute />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      initialRouterEntries: ["/u2"],
    });

    expect(await screen.findByTestId("loading-spinner")).toBeVisible();
  });

  it("shows an error state if results fail to load", async () => {
    server.use(
      buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: useMaterializedViewsColumns,
        rows: [],
        error: "Something went wrong",
      })
    );
    renderComponent(<MaterializedViewsWithRoute />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      initialRouterEntries: ["/u2"],
    });

    expect(await screen.findByText(CLUSTERS_FETCH_ERROR_MESSAGE)).toBeVisible();
  });

  it("shows the empty state when there are no results", async () => {
    server.use(
      buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: useMaterializedViewsColumns,
        rows: [],
      })
    );
    renderComponent(<MaterializedViewsWithRoute />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      initialRouterEntries: ["/u2"],
    });

    expect(
      await screen.findByText("This cluster has no materialized views")
    ).toBeVisible();
  });

  it("renders the materialized views list", async () => {
    server.use(
      buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: useMaterializedViewsColumns,
        rows: [["test_id", "test_materialized_view", "test_definition"]],
      })
    );
    renderComponent(<MaterializedViewsWithRoute />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      initialRouterEntries: ["/u2"],
    });

    expect(await screen.findByText("test_materialized_view")).toBeVisible();
  });
});
