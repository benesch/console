import { fireEvent, screen } from "@testing-library/react";
import React from "react";

import { ErrorCode } from "~/api/materialize/types";
import { buildUseSqlQueryHandler } from "~/api/mocks/buildSqlQueryHandler";
import server from "~/api/mocks/server";
import {
  healthyEnvironment,
  renderComponent,
  setFakeEnvironment,
} from "~/test/utils";

import ConnectionsRoutes from "./ConnectionsRoutes";

jest.mock("~/api/auth");

const useConnectionsColumns = [
  "id",
  "name",
  "schema_name",
  "database_name",
  "type",
  "num_sinks",
  "num_sources",
];

describe("ConnectionsRoutes", () => {
  describe("ConnectionsList", () => {
    it("shows a spinner initially", async () => {
      renderComponent(<ConnectionsRoutes />, {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      });

      expect(await screen.findByText("Connections")).toBeVisible();
      expect(await screen.findByTestId("loading-spinner")).toBeVisible();
    });

    it("shows an error state when there's an error fetching connections", async () => {
      const useConnectionsHandler = buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: useConnectionsColumns,
        rows: [],
        error: {
          message: "Something went wrong",
          code: ErrorCode.INTERNAL_ERROR,
        },
      });
      server.use(useConnectionsHandler);

      renderComponent(<ConnectionsRoutes />, {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      });
      expect(
        await screen.findByText("An error occurred loading connections")
      ).toBeVisible();
    });

    it("shows the empty state when there are no results due to filter changes", async () => {
      const useConnectionsHandler = buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: useConnectionsColumns,
        rows: [],
      });

      server.use(useConnectionsHandler);
      renderComponent(<ConnectionsRoutes />, {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      });

      const searchInput = screen.getByPlaceholderText("Search");

      fireEvent.change(searchInput, { target: { value: "abc" } });

      expect(await screen.findByText("No available connections")).toBeVisible();
      expect(
        await screen.findByText(
          "There are no connections saved in this namespace. Try looking elsewhere or create a new one."
        )
      ).toBeVisible();
    });

    it("should show the empty state and not the 'filters empty state' when the name filter is reset", async () => {
      const useConnectionsHandler = buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: useConnectionsColumns,
        rows: [],
      });

      server.use(useConnectionsHandler);
      renderComponent(<ConnectionsRoutes />, {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
        initialRouterEntries: ["?connectionName=d"],
      });

      const searchInput = screen.getByPlaceholderText("Search");

      fireEvent.change(searchInput, { target: { value: "abc" } });
      expect(await screen.findByText("No available connections")).toBeVisible();
      expect(
        await screen.findByText(
          "There are no connections saved in this namespace. Try looking elsewhere or create a new one."
        )
      ).toBeVisible();

      fireEvent.change(searchInput, { target: { value: "" } });

      expect(
        screen.queryByText(
          "Create a new connection to connect and authenticate to an external system."
        )
      ).toBeNull();
    });

    it("shows the empty state when there are no results", async () => {
      const useConnectionsHandler = buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: useConnectionsColumns,
        rows: [],
      });

      server.use(useConnectionsHandler);
      renderComponent(<ConnectionsRoutes />, {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      });
      expect(await screen.findByText("No available connections")).toBeVisible();
      expect(
        await screen.findByText(
          "Create a new connection to connect and authenticate to an external system."
        )
      ).toBeVisible();
    });

    it("renders connections", async () => {
      const useConnectionsHandler = buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: useConnectionsColumns,
        rows: [
          ["id_1", "name_1", "schema_name_1", "database_name_1", "kafka", 5, 3],
        ],
      });

      server.use(useConnectionsHandler);

      renderComponent(<ConnectionsRoutes />, {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      });
      expect(await screen.findByText("name_1")).toBeVisible();
      expect(await screen.findByText("kafka")).toBeVisible();
      expect(await screen.findByText(5)).toBeVisible();
      expect(await screen.findByText(3)).toBeVisible();
    });
  });
});
