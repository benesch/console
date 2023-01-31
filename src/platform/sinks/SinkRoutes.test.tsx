import { screen } from "@testing-library/react";
import { rest } from "msw";
import React from "react";

import server from "~/api/mocks/server";
import {
  healthyEnvironment,
  renderComponent,
  setFakeEnvironment,
} from "~/test/utils";

import SinkRoutes from "./SinkRoutes";

jest.mock("~/api/auth");

const emptySinksResponse = rest.post("*/api/sql", (_req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json({
      results: [
        { ok: "SET", notices: [] },
        {
          tag: "SELECT 2",
          rows: [],
          col_names: ["id", "oid", "name", "type", "size", "status", "error"],
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
            ["u7", 35347, "json_sink", "kafka", "xsmall", "running", null],
          ],
          col_names: ["id", "oid", "name", "type", "size", "status", "error"],
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
});
