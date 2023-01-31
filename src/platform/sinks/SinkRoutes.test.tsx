import { screen, waitFor } from "@testing-library/react";
import { rest } from "msw";
import React from "react";

import server from "~/api/mocks/server";
import {
  healthyEnvironment,
  renderComponent,
  RenderWithPathname,
  setFakeEnvironment,
} from "~/test/utils";

import SinkRoutes from "./SinkRoutes";

jest.mock("~/api/auth");
jest.mock("~/platform/sinks/SinkDetail", () => {
  return function () {
    return <div>SinkDetail component</div>;
  };
});

const emptySinksResponse = rest.post("*/api/sql", (_req, res, ctx) => {
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

const validSinksResponse = rest.post("*/api/sql", (_req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json({
      results: [
        { ok: "SET", notices: [] },
        {
          tag: "SELECT 1",
          rows: [
            [
              "u7",
              "default",
              "public",
              "json_sink",
              "kafka",
              "xsmall",
              "running",
              null,
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
});

describe("SinkRoutes", () => {
  it("shows a spinner initially", async () => {
    renderComponent(<SinkRoutes />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
    });

    expect(await screen.findByText("Sinks")).toBeVisible();
    expect(await screen.findByTestId("loading-spinner")).toBeVisible();
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
    server.use(validSinksResponse);
    renderComponent(<SinkRoutes />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
    });

    expect(await screen.findByText("json_sink")).toBeVisible();
    expect(await screen.findByText("Running")).toBeVisible();
    expect(await screen.findByText("kafka")).toBeVisible();
    expect(await screen.findByText("xsmall")).toBeVisible();
  });

  it("redirects back to the list for invalid sinks", async () => {
    server.use(validSinksResponse);
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
  });

  it("shows sink details", async () => {
    server.use(validSinksResponse);
    renderComponent(<SinkRoutes />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      initialRouterEntries: [`/u7/default/public/json_sink/errors`],
    });

    expect(screen.getByText("SinkDetail component")).toBeVisible();
  });

  it("updates the path when the name has changed", async () => {
    server.use(validSinksResponse);
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
  });

  it("updates the path when the id has changed", async () => {
    server.use(validSinksResponse);
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
  });
});
