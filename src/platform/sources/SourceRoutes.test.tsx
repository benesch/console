import { screen } from "@testing-library/react";
import { rest } from "msw";
import React from "react";

import server from "~/api/mocks/server";
import {
  healthyEnvironment,
  renderComponent,
  setFakeEnvironment,
} from "~/test/utils";

import SourceRoutes from "./SourceRoutes";

jest.mock("~/api/auth");

const emptySourcesResponse = rest.post("*/api/sql", (_req, res, ctx) => {
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
const validSourcesResponse = rest.post("*/api/sql", (_req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json({
      results: [
        { ok: "SET", notices: [] },
        {
          tag: "SELECT 2",
          rows: [
            ["u3", 23992, "companies", "subsource", null, null, null],
            [
              "u4",
              23993,
              "test_source",
              "postgres",
              "xsmall",
              "stalled",
              "reached maximum WAL lag",
            ],
          ],
          col_names: ["id", "oid", "name", "type", "size", "status", "error"],
          notices: [],
        },
      ],
    })
  );
});

describe("SourceRoutes", () => {
  it("shows a spinner initially", async () => {
    renderComponent(<SourceRoutes />, ({ set }) =>
      setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment)
    );

    expect(await screen.findByText("Sources")).toBeVisible();
    expect(await screen.findByTestId("loading-spinner")).toBeVisible();
  });

  it("shows the empty state when there are no results", async () => {
    server.use(emptySourcesResponse);
    renderComponent(<SourceRoutes />, ({ set }) =>
      setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment)
    );

    expect(await screen.findByText("No available sources")).toBeVisible();
  });

  it("renders the source list", async () => {
    server.use(validSourcesResponse);
    renderComponent(<SourceRoutes />, ({ set }) =>
      setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment)
    );

    expect(await screen.findByText("companies")).toBeVisible();
    expect(await screen.findByText("subsource")).toBeVisible();

    expect(await screen.findByText("test_source")).toBeVisible();
    expect(await screen.findByText("Stalled")).toBeVisible();
    expect(await screen.findByText("postgres")).toBeVisible();
    expect(await screen.findByText("xsmall")).toBeVisible();
  });
});
