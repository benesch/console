import { screen, waitFor } from "@testing-library/react";
import { rest } from "msw";
import React from "react";

import { SqlRequest } from "~/api/materialized";
import server from "~/api/mocks/server";
import {
  healthyEnvironment,
  renderComponent,
  RenderWithPathname,
  setFakeEnvironment,
} from "~/test/utils";

import SourceRoutes from "./SourceRoutes";

jest.mock("~/api/auth");
jest.mock("~/platform/sources/SourceDetail", () => {
  return function () {
    return <div>SourceDetail component</div>;
  };
});

const emptySourcesResponse = rest.post("*/api/sql", (_req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json({
      results: [
        { ok: "SET", notices: [] },
        {
          tag: "SELECT 2",
          rows: [],
          col_names: [
            "id",
            "database_name",
            "schema_name",
            "name",
            "type",
            "size",
            "status",
            "error",
          ],
          notices: [],
        },
      ],
    })
  );
});

const validSourcesResponse = rest.post("*/api/sql", async (req, res, ctx) => {
  const { queries } = (await req.json()) as SqlRequest;
  if (queries.some((q) => q.query.includes("FROM mz_sources"))) {
    return res(
      ctx.status(200),
      ctx.json({
        results: [
          { ok: "SET", notices: [] },
          {
            tag: "SELECT 2",
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
            col_names: [
              "id",
              "database_name",
              "schema_name",
              "name",
              "type",
              "size",
              "status",
              "error",
            ],
            notices: [],
          },
        ],
      })
    );
  }
  if (queries.some((q) => q.query.includes("FROM mz_databases"))) {
    return res(
      ctx.status(200),
      ctx.json({
        results: [
          { ok: "SET", notices: [] },
          {
            tag: "SELECT 2",
            rows: [[1, "materialize"]],
            col_names: ["id", "name"],
            notices: [],
          },
        ],
      })
    );
  }
  throw new Error("Query not matched");
});

describe("SourceRoutes", () => {
  it("shows a spinner initially", async () => {
    renderComponent(<SourceRoutes />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
    });

    expect(await screen.findByText("Sources")).toBeVisible();
    expect(await screen.findByTestId("loading-spinner")).toBeVisible();
  });

  it("shows the empty state when there are no results", async () => {
    server.use(emptySourcesResponse);
    renderComponent(<SourceRoutes />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
    });

    expect(await screen.findByText("No available sources")).toBeVisible();
  });

  it("renders the source list", async () => {
    server.use(validSourcesResponse);
    renderComponent(<SourceRoutes />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
    });

    expect(await screen.findByText("test_source")).toBeVisible();
    expect(await screen.findByText("Stalled")).toBeVisible();
    expect(await screen.findByText("postgres")).toBeVisible();
    expect(await screen.findByText("xsmall")).toBeVisible();
  });

  it("redirects back to the list for invalid sources", async () => {
    server.use(validSourcesResponse);
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
  });

  it("shows source details", async () => {
    server.use(validSourcesResponse);
    renderComponent(<SourceRoutes />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      initialRouterEntries: [`/u4/default/public/test_source/errors`],
    });

    expect(screen.getByText("SourceDetail component")).toBeVisible();
  });

  it("updates the path when the name has changed", async () => {
    server.use(validSourcesResponse);
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
    expect(screen.getByText("SourceDetail component")).toBeVisible();
  });

  it("updates the path when the id has changed", async () => {
    server.use(validSourcesResponse);
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
    expect(screen.getByText("SourceDetail component")).toBeVisible();
  });
});
