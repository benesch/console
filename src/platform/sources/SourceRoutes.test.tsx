import { screen, waitFor } from "@testing-library/react";
import { format } from "date-fns";
import React from "react";

import { buildUseSqlQueryHandler } from "~/api/mocks/buildSqlQueryHandler";
import server from "~/api/mocks/server";
import * as SourceDetail from "~/platform/sources/SourceDetail";
import {
  healthyEnvironment,
  renderComponent,
  RenderWithPathname,
  setFakeEnvironment,
} from "~/test/utils";

import { SOURCES_FETCH_ERROR_MESSAGE } from "./constants";
import SourceRoutes from "./SourceRoutes";

jest.mock("~/api/auth");

jest.mock("~/platform/sources/SourceErrorsGraph", () => {
  return function () {
    return <div>Source Errors Graph</div>;
  };
});

const useSourcesColumns = [
  "id",
  "database_name",
  "schema_name",
  "name",
  "type",
  "size",
  "status",
  "error",
];

const MockSourceDetail = () => <div>SourceDetail component</div>;

const useSourceErrorsColumns = ["last_occurred", "error", "count"];

const emptyUseSourcesHandler = buildUseSqlQueryHandler({
  type: "SELECT" as const,
  columns: useSourcesColumns,
  rows: [],
});

function setupSourceDetailPage() {
  const source = {
    id: "u4",
    database_name: "default",
    schema_name: "public",
    name: "test_source",
    type: "postgres",
    size: "xsmall",
    status: "stalled",
    error: "reached maximum WAL lag",
  };
  const validUseSourcesHandler = buildUseSqlQueryHandler({
    type: "SELECT" as const,
    columns: useSourcesColumns,
    rows: [Object.values(source)],
  });

  const emptyUseSourceErrorsHandler = buildUseSqlQueryHandler({
    type: "SELECT" as const,
    columns: useSourceErrorsColumns,
    rows: [],
  });
  const validUseShowCreateHandler = buildUseSqlQueryHandler({
    type: "SHOW CREATE" as const,
    name: source.name,
    createSql: "CREATE SOURCE ...",
  });

  server.use(validUseSourcesHandler);
  server.use(emptyUseSourceErrorsHandler);
  server.use(validUseShowCreateHandler);

  return `/${source.id}/${source.database_name}/${source.schema_name}/${source.name}/errors`;
}

describe("SourceRoutes", () => {
  describe("SourcesList", () => {
    it("shows a spinner initially", async () => {
      renderComponent(<SourceRoutes />, {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      });

      expect(await screen.findByText("Sources")).toBeVisible();
      expect(await screen.findByTestId("loading-spinner")).toBeVisible();
    });

    it("shows an error state when sources fail to fetch", async () => {
      server.use(
        buildUseSqlQueryHandler({
          type: "SELECT" as const,
          columns: useSourcesColumns,
          rows: [],
          error: "Something went wrong.",
        })
      );
      renderComponent(<SourceRoutes />, {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      });
      expect(
        await screen.findByText(SOURCES_FETCH_ERROR_MESSAGE)
      ).toBeVisible();
    });

    it("shows the empty state when there are no results", async () => {
      server.use(emptyUseSourcesHandler);
      renderComponent(<SourceRoutes />, {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      });

      expect(await screen.findByText("No available sources")).toBeVisible();
    });

    it("renders the source list", async () => {
      server.use(
        buildUseSqlQueryHandler({
          type: "SELECT" as const,
          columns: useSourcesColumns,
          rows: [
            [
              "u4",
              "default",
              "public",
              "test_source",
              "postgres",
              "xsmall",
              "stalled",
              "reached maximum WAL lag",
            ],
          ],
        })
      );
      renderComponent(<SourceRoutes />, {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      });

      expect(await screen.findByText("test_source")).toBeVisible();
      expect(await screen.findByText("Stalled")).toBeVisible();
      expect(await screen.findByText("postgres")).toBeVisible();
      expect(await screen.findByText("xsmall")).toBeVisible();
    });

    describe("SourceDetail", () => {
      it("renders a spinner initially", async () => {
        const initialRoute = setupSourceDetailPage();

        renderComponent(<SourceRoutes />, {
          initializeState: ({ set }) =>
            setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
          initialRouterEntries: [initialRoute],
        });

        expect(await screen.findByTestId("loading-spinner")).toBeVisible();
      });

      it("renders an error state when source errors fail to fetch", async () => {
        const initialRoute = setupSourceDetailPage();

        const useSourcesErrorsHandler = buildUseSqlQueryHandler({
          type: "SELECT" as const,
          columns: useSourceErrorsColumns,
          rows: [],
          error: "Something went wrong",
        });

        server.use(useSourcesErrorsHandler);

        renderComponent(<SourceRoutes />, {
          initializeState: ({ set }) =>
            setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
          initialRouterEntries: [initialRoute],
        });
        expect(
          await screen.findByText(SOURCES_FETCH_ERROR_MESSAGE)
        ).toBeVisible();
      });

      it("renders an empty state when there are no sink errors", async () => {
        const initialRoute = setupSourceDetailPage();

        renderComponent(<SourceRoutes />, {
          initializeState: ({ set }) =>
            setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
          initialRouterEntries: [initialRoute],
        });
        expect(
          await screen.findByText("No errors during this time period.")
        ).toBeVisible();
      });

      it("renders a list of source errors", async () => {
        const initialRoute = setupSourceDetailPage();
        const mockTimestamp = 0;

        const validUseSourcesErrorsHandler = buildUseSqlQueryHandler({
          type: "SELECT" as const,
          columns: useSourceErrorsColumns,
          rows: [[`${mockTimestamp}`, "error_1", "1"]],
        });

        server.use(validUseSourcesErrorsHandler);

        renderComponent(<SourceRoutes />, {
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
  });

  describe("Redirect", () => {
    it("redirects back to the list for invalid sources", async () => {
      const sourceDetailSpy = jest
        .spyOn(SourceDetail, "default")
        .mockImplementation(MockSourceDetail);

      server.use(emptyUseSourcesHandler);
      renderComponent(
        <RenderWithPathname>
          <SourceRoutes />
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
      expect(screen.queryByText("SourceDetail component")).toBeNull();
      sourceDetailSpy.mockRestore();
    });

    it("updates the path when the name has changed", async () => {
      const sourceDetailSpy = jest
        .spyOn(SourceDetail, "default")
        .mockImplementation(MockSourceDetail);

      setupSourceDetailPage();

      renderComponent(
        <RenderWithPathname>
          <SourceRoutes />
        </RenderWithPathname>,
        {
          initializeState: ({ set }) =>
            setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
          initialRouterEntries: [`/u4/default/public/old_name/errors`],
        }
      );

      expect(
        await screen.findByText("/u4/default/public/test_source/errors")
      ).toBeVisible();
      expect(await screen.findByText("SourceDetail component")).toBeVisible();
      sourceDetailSpy.mockRestore();
    });

    it("updates the path when the id has changed", async () => {
      const sourceDetailSpy = jest
        .spyOn(SourceDetail, "default")
        .mockImplementation(MockSourceDetail);

      setupSourceDetailPage();
      renderComponent(
        <RenderWithPathname>
          <SourceRoutes />
        </RenderWithPathname>,
        {
          initializeState: ({ set }) =>
            setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
          initialRouterEntries: [`/u1/default/public/test_source/errors`],
        }
      );

      expect(
        await screen.findByText("/u4/default/public/test_source/errors")
      ).toBeVisible();
      expect(await screen.findByText("SourceDetail component")).toBeVisible();
      sourceDetailSpy.mockRestore();
    });
  });
});
