import { screen, waitFor } from "@testing-library/react";
import { format } from "date-fns";
import React from "react";

import { ErrorCode } from "~/api/materialize/types";
import { buildUseSqlQueryHandler } from "~/api/mocks/buildSqlQueryHandler";
import server from "~/api/mocks/server";
import * as SinkDetail from "~/platform/sinks/SinkDetail";
import {
  healthyEnvironment,
  renderComponent,
  RenderWithPathname,
  setFakeEnvironment,
} from "~/test/utils";

import { SINKS_FETCH_ERROR_MESSAGE } from "./constants";
import SinkRoutes from "./SinkRoutes";

jest.mock("~/api/auth");
jest.mock("~/platform/sinks/SinkErrorsGraph", () => {
  return function () {
    return <div>Sink Errors Graph</div>;
  };
});

const MockSinkDetail = () => <div>SinkDetail component</div>;

const useSinksColumns = [
  "id",
  "name",
  "type",
  "size",
  "schemaName",
  "databaseName",
  "status",
  "error",
];

const useSinkErrorsColumns = ["lastOccurred", "error", "count"];

const emptySinksResponse = buildUseSqlQueryHandler({
  type: "SELECT" as const,
  columns: useSinksColumns,
  rows: [],
});

function setupSinkDetailPage() {
  const sink = {
    id: "u7",
    name: "json_sink",
    type: "kafka",
    size: "xsmall",
    schemaName: "public",
    databaseName: "default",
    status: "running",
    error: null,
  };

  const validUseSinksHandler = buildUseSqlQueryHandler({
    type: "SELECT" as const,
    columns: useSinksColumns,
    rows: [Object.values(sink)],
  });

  const validUseSinkErrorsHandler = buildUseSqlQueryHandler({
    type: "SELECT" as const,
    columns: useSinkErrorsColumns,
    rows: [],
  });

  const validUseShowCreateHandler = buildUseSqlQueryHandler({
    type: "SHOW CREATE" as const,
    name: sink.name,
    createSql: "CREATE SINK ...",
  });

  server.use(validUseSinksHandler);
  server.use(validUseShowCreateHandler);
  server.use(validUseSinkErrorsHandler);

  return `/${sink.id}/${sink.databaseName}/${sink.schemaName}/${sink.name}/errors`;
}

describe("SinkRoutes", () => {
  describe("SinksList", () => {
    it("shows a spinner initially", async () => {
      server.use(emptySinksResponse);

      renderComponent(<SinkRoutes />, {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      });

      expect(await screen.findByText("Sinks")).toBeVisible();
      expect(await screen.findByTestId("loading-spinner")).toBeVisible();
    });

    it("shows an error state when sinks fail to fetch", async () => {
      server.use(
        buildUseSqlQueryHandler({
          type: "SELECT" as const,
          columns: useSinksColumns,
          rows: [],
          error: {
            message: "Something went wrong",
            code: ErrorCode.INTERNAL_ERROR,
          },
        })
      );
      renderComponent(<SinkRoutes />, {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      });

      expect(await screen.findByText(SINKS_FETCH_ERROR_MESSAGE)).toBeVisible();
    });

    it("shows the empty state when there are no results", async () => {
      server.use(emptySinksResponse);
      renderComponent(<SinkRoutes />, {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      });

      expect(await screen.findByText("No available sinks")).toBeVisible();
    });

    it("renders the sink list", async () => {
      server.use(
        buildUseSqlQueryHandler({
          type: "SELECT" as const,
          columns: useSinksColumns,
          rows: [
            [
              "u7",
              "json_sink",
              "kafka",
              "xsmall",
              "public",
              "default",
              "running",
              null,
            ],
          ],
        })
      );
      renderComponent(<SinkRoutes />, {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      });

      expect(await screen.findByText("json_sink")).toBeVisible();
      expect(await screen.findByText("Running")).toBeVisible();
      expect(await screen.findByText("kafka")).toBeVisible();
      expect(await screen.findByText("xsmall")).toBeVisible();
    });
  });

  describe("SinkDetail", () => {
    it("renders a spinner initially", async () => {
      const initialRoute = setupSinkDetailPage();

      renderComponent(<SinkRoutes />, {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
        initialRouterEntries: [initialRoute],
      });

      expect(await screen.findByTestId("loading-spinner")).toBeVisible();
    });

    it("renders an error state when sink errors fail to fetch", async () => {
      const initialRoute = setupSinkDetailPage();

      const useSinkErrorsHandler = buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: useSinkErrorsColumns,
        rows: [],
        error: {
          message: "Something went wrong",
          code: ErrorCode.INTERNAL_ERROR,
        },
      });

      server.use(useSinkErrorsHandler);

      renderComponent(<SinkRoutes />, {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
        initialRouterEntries: [initialRoute],
      });
      expect(await screen.findByText(SINKS_FETCH_ERROR_MESSAGE)).toBeVisible();
    });

    it("renders an empty state when there are no sink errors", async () => {
      const initialRoute = setupSinkDetailPage();

      renderComponent(<SinkRoutes />, {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
        initialRouterEntries: [initialRoute],
      });
      expect(
        await screen.findByText("No errors during this time period.")
      ).toBeVisible();
    });

    it("renders a list of sink errors", async () => {
      const initialRoute = setupSinkDetailPage();
      const mockTimestamp = 0;

      const validUseSinkErrorsHandler = buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: useSinkErrorsColumns,
        rows: [[`${mockTimestamp}`, "error_1", "1"]],
      });

      server.use(validUseSinkErrorsHandler);

      renderComponent(<SinkRoutes />, {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
        initialRouterEntries: [initialRoute],
      });
      expect(await screen.findByText("error_1")).toBeVisible();
      expect(await screen.findByText("1")).toBeVisible();
      expect(
        await screen.findByText(format(mockTimestamp, "MM-dd-yy"))
      ).toBeVisible();
    });
  });

  describe("Redirect", () => {
    it("redirects back to the list for invalid sinks", async () => {
      const sinkDetailSpy = jest
        .spyOn(SinkDetail, "default")
        .mockImplementation(MockSinkDetail);

      setupSinkDetailPage();

      renderComponent(
        <RenderWithPathname>
          <SinkRoutes />
        </RenderWithPathname>,
        {
          initializeState: ({ set }) =>
            setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
          initialRouterEntries: [`/u99/default/public/does_not_exist/errors`],
        }
      );

      await waitFor(() =>
        expect(screen.getByTestId("pathname")).toHaveTextContent(/^\/$/)
      );
      expect(screen.queryByText("SinkDetail component")).toBeNull();
      sinkDetailSpy.mockRestore();
    });

    it("shows sink details", async () => {
      const sinkDetailSpy = jest
        .spyOn(SinkDetail, "default")
        .mockImplementation(MockSinkDetail);
      setupSinkDetailPage();

      renderComponent(<SinkRoutes />, {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
        initialRouterEntries: [`/u7/default/public/json_sink/errors`],
      });

      expect(screen.getByText("SinkDetail component")).toBeVisible();
      sinkDetailSpy.mockRestore();
    });

    it("updates the path when the name has changed", async () => {
      const sinkDetailSpy = jest
        .spyOn(SinkDetail, "default")
        .mockImplementation(MockSinkDetail);
      setupSinkDetailPage();

      renderComponent(
        <RenderWithPathname>
          <SinkRoutes />
        </RenderWithPathname>,
        {
          initializeState: ({ set }) =>
            setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
          initialRouterEntries: [`/u7/default/public/old_name/errors`],
        }
      );

      expect(
        await screen.findByText("/u7/default/public/json_sink/errors")
      ).toBeVisible();
      expect(screen.getByText("SinkDetail component")).toBeVisible();
      sinkDetailSpy.mockRestore();
    });

    it("updates the path when the id has changed", async () => {
      const sinkDetailSpy = jest
        .spyOn(SinkDetail, "default")
        .mockImplementation(MockSinkDetail);
      setupSinkDetailPage();
      renderComponent(
        <RenderWithPathname>
          <SinkRoutes />
        </RenderWithPathname>,
        {
          initializeState: ({ set }) =>
            setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
          initialRouterEntries: [`/u1/default/public/json_sink/errors`],
        }
      );

      expect(
        await screen.findByText("/u7/default/public/json_sink/errors")
      ).toBeVisible();
      expect(screen.getByText("SinkDetail component")).toBeVisible();
      sinkDetailSpy.mockRestore();
    });
  });
});
