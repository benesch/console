import { screen } from "@testing-library/react";
import React from "react";

import { ErrorCode } from "~/api/materialize/types";
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

const emptyResponse = buildUseSqlQueryHandler({
  type: "SELECT" as const,
  columns: ["id", "name"],
  rows: [],
});

const validResponse = buildUseSqlQueryHandler({
  type: "SELECT" as const,
  columns: ["id", "name"],
  rows: [
    ["u2", "subsource1"],
    ["u3", "subsource2"],
  ],
});

describe("Subsources", () => {
  it("shows a spinner initially", async () => {
    renderComponent(<Subsources sourceId="u1" />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
    });

    expect(screen.getByText("Subsources")).toBeVisible();
    expect(screen.getByTestId("loading-spinner")).toBeVisible();
  });

  it("shows an error state when subsources fail to fetch", async () => {
    server.use(
      buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: ["id", "name"],
        rows: [],
        error: {
          message: "Something went wrong",
          code: ErrorCode.INTERNAL_ERROR,
        },
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
