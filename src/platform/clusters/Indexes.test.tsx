import { screen } from "@testing-library/react";
import React from "react";

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

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn().mockReturnValue({ id: 1 }),
}));

const IndexesWithProviders = () => (
  <ClustersProvider>
    <Indexes />
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
    renderComponent(<IndexesWithProviders />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
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
    renderComponent(<IndexesWithProviders />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
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
    renderComponent(<IndexesWithProviders />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
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
    renderComponent(<IndexesWithProviders />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
    });

    expect(await screen.findByText("test_index")).toBeVisible();
    expect(await screen.findByText("test_view_1")).toBeVisible();
    expect(await screen.findByText("view")).toBeVisible();
  });
});
