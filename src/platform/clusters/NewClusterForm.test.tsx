import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { ReactElement } from "react";
import { Route, Routes } from "react-router-dom";

import { buildUseSqlQueryHandler } from "~/api/mocks/buildSqlQueryHandler";
import server from "~/api/mocks/server";
import {
  createProviderWrapper,
  healthyEnvironment,
  setFakeEnvironment,
} from "~/test/utils";

import NewClusterForm from "./NewClusterForm";

jest.mock("~/api/auth");
const refetchMock = jest.fn();

const Wrapper = createProviderWrapper({
  initializeState: ({ set }) =>
    setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
});

const renderComponent = (element: ReactElement) => {
  return render(
    <Wrapper>
      <Routes>
        <Route path="/" element={<div>Cluster List</div>} />
        <Route path="/new-cluster" element={element} />
      </Routes>
    </Wrapper>
  );
};

describe("NewClusterForm", () => {
  beforeEach(() => {
    server.use(
      buildUseSqlQueryHandler({
        type: "SHOW" as const,
        column: "allowed_cluster_replica_sizes",
        rows: [['"3xsmall", "2xsmall", xsmall, small, medium, large, xlarge']],
      })
    );
    server.use(
      buildUseSqlQueryHandler({
        type: "SHOW" as const,
        column: "max_replicas_per_cluster",
        rows: [[5]],
      })
    );
    history.pushState(undefined, "", "/new-cluster");
  });

  it("creates a cluster successfully and redirects to the cluster list", async () => {
    server.use(
      buildUseSqlQueryHandler({
        type: "CREATE" as const,
      })
    );
    const user = userEvent.setup();
    renderComponent(<NewClusterForm refetchClusters={refetchMock} />);

    const clusterNameInput = screen.getByLabelText("Name");
    const replicaNameInput = screen.getByPlaceholderText("r1");
    await user.type(clusterNameInput, "test_cluster");
    await user.type(replicaNameInput, "replica_1");
    await user.click(screen.getByText("Create cluster"));

    expect(refetchMock).toHaveBeenCalled();
    expect(await screen.findByText("Cluster List")).toBeVisible();
  });

  it("shows an error for missing cluster and replica names", async () => {
    server.use(
      buildUseSqlQueryHandler({
        type: "CREATE" as const,
      })
    );
    const user = userEvent.setup();
    renderComponent(<NewClusterForm refetchClusters={refetchMock} />);

    await user.click(screen.getByText("Create cluster"));

    expect(await screen.findByText("Cluster name is required.")).toBeVisible();
    expect(await screen.findByText("Replica name is required.")).toBeVisible();
  });

  it("shows an error for duplicate cluster names", async () => {
    server.use(
      buildUseSqlQueryHandler({
        type: "CREATE" as const,
        error: "catalog item 'default' already exists",
      })
    );
    const user = userEvent.setup();
    renderComponent(<NewClusterForm refetchClusters={refetchMock} />);

    const clusterNameInput = screen.getByLabelText("Name");
    const replicaNameInput = screen.getByPlaceholderText("r1");
    await user.type(clusterNameInput, "default");
    await user.type(replicaNameInput, "r1");
    await user.click(screen.getByText("Create cluster"));

    expect(
      await screen.findByText("A cluster with that name already exists.")
    ).toBeVisible();
  });

  it("shows the database error when an unexpected error occurs ", async () => {
    const createSecretHandler = buildUseSqlQueryHandler({
      type: "CREATE" as const,
      error: "some unexpected database error",
    });

    server.use(createSecretHandler);

    const user = userEvent.setup();

    renderComponent(<NewClusterForm refetchClusters={refetchMock} />);

    const clusterNameInput = screen.getByLabelText("Name");
    const replicaNameInput = screen.getByPlaceholderText("r1");
    await user.type(clusterNameInput, "default");
    await user.type(replicaNameInput, "r1");
    await user.click(screen.getByText("Create cluster"));

    expect(
      await screen.findByText("some unexpected database error")
    ).toBeVisible();
  });
});
