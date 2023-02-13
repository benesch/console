import { screen } from "@testing-library/react";
import { rest } from "msw";
import React from "react";

import server from "~/api/mocks/server";
import {
  healthyEnvironment,
  renderComponent,
  setFakeEnvironment,
} from "~/test/utils";

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
