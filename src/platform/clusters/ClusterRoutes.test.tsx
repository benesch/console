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

const useClustersFetchColumns = [
  "id",
  "cluster_name",
  "replica_id",
  "replica_name",
  "size",
  "linked_object_id",
];

const emptyClustersResponse = rest.post("*/api/sql", (_req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json({
      results: [
        {
          tag: "SELECT 4",
          rows: [],
          col_names: useClustersFetchColumns,
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
        {
          tag: "SELECT 4",
          rows: [
            ["u1", "default", "r1", "u1", "xsmall", 0.20542144775390625],
            ["s1", "mz_system", "r1", "u2", "2xsmall", 1.557779312133789],
            [
              "s2",
              "mz_introspection",
              "r1",
              "u3",
              "2xsmall",
              4.108572006225586,
              "u10",
            ],
            [
              "u11",
              "materialize_public_pg_source",
              "linked",
              "u13",
              "3xsmall",
              1.2143135070800781,
              "u10",
            ],
          ],
          col_names: useClustersFetchColumns,
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
