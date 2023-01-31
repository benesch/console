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

import ClusterRoutes from "./ClusterRoutes";

jest.mock("~/api/auth");
jest.mock("~/platform/clusters/ClusterDetail", () => {
  return function () {
    return <div>ClusterDetail component</div>;
  };
});

const emptyClustersResponse = rest.post("*/api/sql", (_req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json({
      results: [
        { ok: "SET", notices: [] },
        {
          tag: "SELECT 4",
          rows: [],
          col_names: [
            "id",
            "replica_name",
            "cluster_id",
            "size",
            "cluster_name",
            "memory_percent",
          ],
          notices: [],
        },
      ],
    })
  );
});

const validClustersResponse = rest.post("*/api/sql", (_req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json({
      results: [
        { ok: "SET", notices: [] },
        {
          tag: "SELECT 4",
          rows: [
            [1, "r1", "u1", "xsmall", "default", 0.20542144775390625],
            [2, "r1", "s1", "2xsmall", "mz_system", 1.557779312133789],
            [3, "r1", "s2", "2xsmall", "mz_introspection", 4.108572006225586],
            [
              13,
              "linked",
              "u11",
              "3xsmall",
              "materialize_public_pg_source",
              1.2143135070800781,
            ],
          ],
          col_names: [
            "id",
            "replica_name",
            "cluster_id",
            "size",
            "cluster_name",
            "memory_percent",
          ],
          notices: [],
        },
      ],
    })
  );
});

describe("ClusterRoutes", () => {
  it("shows a spinner initially", async () => {
    renderComponent(<ClusterRoutes />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
    });

    expect(await screen.findByText("Clusters")).toBeVisible();
    expect(await screen.findByTestId("loading-spinner")).toBeVisible();
  });

  it("shows the empty state when there are no results", async () => {
    server.use(emptyClustersResponse);
    renderComponent(<ClusterRoutes />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
    });

    expect(await screen.findByText("No available clusters")).toBeVisible();
  });

  it("renders the cluster list", async () => {
    server.use(validClustersResponse);
    renderComponent(<ClusterRoutes />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
    });

    expect(await screen.findByText("Clusters")).toBeVisible();
    expect(await screen.findByText("default")).toBeVisible();
    expect(await screen.findByText("mz_introspection")).toBeVisible();
  });

  it("redirects back to the list for invalid clusters", async () => {
    server.use(validClustersResponse);
    renderComponent(
      <RenderWithPathname>
        <ClusterRoutes />
      </RenderWithPathname>,
      {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
        initialRouterEntries: ["/u99/does_not_exist"],
      }
    );

    await waitFor(() =>
      expect(screen.getByTestId("pathname")).toHaveTextContent(/^\/$/)
    );
    expect(screen.queryByText("ClusterDetail component")).toBeNull();
  });

  it("shows cluster details", async () => {
    server.use(validClustersResponse);
    renderComponent(<ClusterRoutes />, {
      initializeState: ({ set }) =>
        setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      initialRouterEntries: ["/u1/default"],
    });

    expect(screen.getByText("ClusterDetail component")).toBeVisible();
  });

  it("updates the path when the name has changed", async () => {
    server.use(validClustersResponse);
    renderComponent(
      <RenderWithPathname>
        <ClusterRoutes />
      </RenderWithPathname>,
      {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
        initialRouterEntries: ["/u1/old_name"],
      }
    );

    expect(await screen.findByText("/u1/default")).toBeVisible();
    expect(screen.getByText("ClusterDetail component")).toBeVisible();
  });

  it("updates the path when the id has changed", async () => {
    server.use(validClustersResponse);
    renderComponent(
      <RenderWithPathname>
        <ClusterRoutes />
      </RenderWithPathname>,
      {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
        initialRouterEntries: ["/u1/default"],
      }
    );

    expect(await screen.findByText("/u1/default")).toBeVisible();
    expect(screen.getByText("ClusterDetail component")).toBeVisible();
  });
});
