import { screen } from "@testing-library/react";
import { rest } from "msw";
import React from "react";

import { buildUseSqlQueryHandler } from "~/api/mocks/buildSqlQueryHandler";
import server from "~/api/mocks/server";
import {
  healthyEnvironment,
  renderComponent,
  setFakeEnvironment,
} from "~/test/utils";

import { SOURCES_FETCH_ERROR_MESSAGE } from "./constants";
import Subsources from "./Subsources";

jest.mock("~/api/auth");

const emptyResponse = rest.post("*/api/sql", (_req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json({
      results: [
        { ok: "SET", notices: [] },
        {
          tag: "SELECT 2",
          rows: [],
          col_names: ["id", "name"],
          notices: [],
        },
      ],
    })
  );
});
const validResponse = rest.post("*/api/sql", (_req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json({
      results: [
        { ok: "SET", notices: [] },
        {
          tag: "SELECT 2",
          rows: [
            ["u2", "subsource1"],
            ["u3", "subsource2"],
          ],
          col_names: ["id", "name"],
          notices: [],
        },
      ],
    })
  );
});

describe("Subsources", () => {
  it("shows a spinner initially", async () => {
    renderComponent(<Subsources />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
    });

    expect(await screen.findByText("Subsources")).toBeVisible();
    expect(await screen.findByTestId("loading-spinner")).toBeVisible();
  });

  it("shows an error state when subsources fail to fetch", async () => {
    server.use(
      buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: ["id", "name"],
        rows: [],
        error: "Something went wrong.",
      })
    );
    renderComponent(<Subsources sourceId="u4" />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
    });

    expect(await screen.findByText(SOURCES_FETCH_ERROR_MESSAGE)).toBeVisible();
  });

  it("shows the empty state when there are no results", async () => {
    server.use(emptyResponse);
    renderComponent(<Subsources sourceId="u4" />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
    });

    expect(await screen.findByText("No subsources")).toBeVisible();
  });

  it("renders the source list", async () => {
    server.use(validResponse);
    renderComponent(<Subsources sourceId="u4" />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
    });

    expect(await screen.findByText("subsource1")).toBeVisible();
    expect(await screen.findByText("subsource2")).toBeVisible();
  });
});
