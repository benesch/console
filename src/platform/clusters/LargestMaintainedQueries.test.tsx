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

import LargestMaintainedQueries from "./LargestMaintainedQueries";

jest.mock("~/api/auth");

const useLargestMaintainedQueriesColumns = [
  "id",
  "name",
  "memoryPercentage",
  "type",
  "schemaName",
  "databaseName",
];

const emptyResponse = buildUseSqlQueryHandler({
  type: "SELECT" as const,
  columns: useLargestMaintainedQueriesColumns,
  rows: [],
});

describe("LargestMaintainedQueries", () => {
  it("shows a spinner initially", async () => {
    server.use(emptyResponse);

    renderComponent(
      <LargestMaintainedQueries
        clusterId="u1"
        clusterName="default"
        replicaName="r1"
      />,
      {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      }
    );

    expect(
      await screen.findByText("Resource intensive maintained queries")
    ).toBeVisible();
    expect(await screen.findByTestId("loading-spinner")).toBeVisible();
  });

  it("shows an error state when the data fails to load", async () => {
    server.use(
      buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: useLargestMaintainedQueriesColumns,
        rows: [],
        error: {
          message: "Something went wrong",
          code: ErrorCode.INTERNAL_ERROR,
        },
      })
    );
    renderComponent(
      <LargestMaintainedQueries
        clusterId="u1"
        clusterName="default"
        replicaName="r1"
      />,
      {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      }
    );

    expect(
      await screen.findByText(
        "An error has occurred loading maintained queries"
      )
    ).toBeVisible();
  });

  it("shows the empty state when there are no results", async () => {
    server.use(emptyResponse);
    renderComponent(
      <LargestMaintainedQueries
        clusterId="u1"
        clusterName="default"
        replicaName="r1"
      />,
      {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      }
    );

    expect(
      await screen.findByText("No maintained queries found")
    ).toBeVisible();
  });

  it("renders the maintained queries list", async () => {
    server.use(
      buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: useLargestMaintainedQueriesColumns,
        rows: [
          [
            188,
            "customer_view",
            "31.8345902256816625595092773437523525698",
            "materialized-view",
            "public",
            "materialize",
          ],
        ],
      })
    );
    renderComponent(
      <LargestMaintainedQueries
        clusterId="u1"
        clusterName="default"
        replicaName="r1"
      />,
      {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      }
    );

    expect(
      await screen.findByText("materialize.public.customer_view")
    ).toBeVisible();
    expect(await screen.findByText("Materialized View")).toBeVisible();
    expect(await screen.findByText("31.8%")).toBeVisible();
  });
});
