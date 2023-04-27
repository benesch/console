import { screen } from "@testing-library/react";
import React from "react";
import { Route, Routes } from "react-router-dom";

import { ClustersProvider } from "~/api/materialize/useClusters";
import { buildUseSqlQueryHandler } from "~/api/mocks/buildSqlQueryHandler";
import server from "~/api/mocks/server";
import {
  healthyEnvironment,
  renderComponent,
  setFakeEnvironment,
} from "~/test/utils";

import { CLUSTERS_FETCH_ERROR_MESSAGE } from "./constants";
import Indexes from "./Indexes";

jest.mock("~/api/auth");

const IndexesWithSetup = () => (
  <ClustersProvider>
    <Routes>
      <Route path="/:id/*" element={<Indexes />} />
    </Routes>
  </ClustersProvider>
);

const useIndexesColumns = ["id", "name", "relation_name", "type"];

describe("Indexes", () => {
  it("shows a spinner initially", async () => {
    server.use(
      buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: useIndexesColumns,
        rows: [],
      })
    );
    renderComponent(<IndexesWithSetup />, {
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
        columns: useIndexesColumns,
        rows: [],
        error: "Something went wrong",
      })
    );
    renderComponent(<IndexesWithSetup />, {
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
        columns: useIndexesColumns,
        rows: [],
      })
    );
    renderComponent(<IndexesWithSetup />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      initialRouterEntries: ["/u2"],
    });

    expect(
      await screen.findByText("This cluster has no indexes")
    ).toBeVisible();
  });

  it("renders the indexes list", async () => {
    server.use(
      buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: useIndexesColumns,
        rows: [["test_id", "test_index", "test_view_1", "view"]],
      })
    );
    renderComponent(<IndexesWithSetup />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      initialRouterEntries: ["/u2"],
    });

    expect(await screen.findByText("test_index")).toBeVisible();
    expect(await screen.findByText("test_view_1")).toBeVisible();
    expect(await screen.findByText("view")).toBeVisible();
  });
});
