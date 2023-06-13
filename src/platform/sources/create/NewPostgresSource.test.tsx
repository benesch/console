import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { ReactElement } from "react";
import { Route, Routes } from "react-router-dom";

import { ErrorCode } from "~/api/materialize/types";
import {
  buildSqlQueryHandler,
  buildUseSqlQueryHandler,
} from "~/api/mocks/buildSqlQueryHandler";
import server from "~/api/mocks/server";
import {
  createProviderWrapper,
  healthyEnvironment,
  setFakeEnvironment,
} from "~/test/utils";

import { NewPostgresSourceForm } from "./NewPostgresSource";

jest.mock("~/api/auth");

const Wrapper = createProviderWrapper({
  initializeState: ({ set }) =>
    setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
});

const renderComponent = (element: ReactElement) => {
  return render(
    <Wrapper>
      <Routes>
        <Route path="/sources/*">
          <Route
            path=":id/:db/:schema/:name/errors"
            element={<div>Source Details</div>}
          />
          <Route path="new/*">
            <Route path="postgres" element={element} />
          </Route>
        </Route>
      </Routes>
    </Wrapper>
  );
};

describe("NewPostgresSourceForm", () => {
  beforeEach(() => {
    server.use(
      // useSchemas
      buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: ["id", "name", "database_id", "database_name"],
        rows: [["u1", "public", "u1", "materialize"]],
      }),
      // useAvailableClusterSizes
      buildUseSqlQueryHandler({
        type: "SHOW" as const,
        column: "allowed_cluster_replica_sizes",
        rows: [['"3xsmall", "2xsmall", xsmall, small, medium, large, xlarge']],
      }),
      // useConnectorClusters
      buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: ["id", "name"],
        rows: [["u1", "default"]],
      }),
      // useConnectionsFiltered
      buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: ["id", "name", "schema_name", "database_name", "type"],
        rows: [["u1", "pg_connection", "public", "materialize", "postgres"]],
      })
    );
    history.pushState(undefined, "", "/sources/new/postgres?connectionId=u1");
  });

  it("creates a source successfully and redirects to the new source", async () => {
    server.use(
      buildSqlQueryHandler([
        { type: "CREATE" as const },
        {
          type: "SELECT" as const,
          columns: ["id", "database_name", "schema_name"],
          rows: [["u3", "materialize", "public"]],
        },
      ])
    );
    const user = userEvent.setup();
    renderComponent(<NewPostgresSourceForm />);

    const sourceNameInput = screen.getByLabelText("Name*");
    await user.type(sourceNameInput, "pg_source");
    await user.click(screen.getByLabelText("Select cluster"));
    // wait for cluster options to load
    expect(await screen.findByText("default")).toBeVisible();
    await user.click(screen.getByText("default"));
    const publicationInput = screen.getByLabelText("Publication*");
    await user.type(publicationInput, "mz_source");
    await user.click(screen.getByLabelText("For all tables"));
    await user.click(screen.getByText("Create source"));

    expect(await screen.findByText("Source Details")).toBeVisible();
    expect(location.pathname).toEqual(
      "/sources/u3/materialize/public/pg_source/errors"
    );
  });

  it("creates a new cluster and source successfully", async () => {
    server.use(
      buildSqlQueryHandler([
        { type: "CREATE" as const },
        {
          type: "SELECT" as const,
          columns: ["id", "database_name", "schema_name"],
          rows: [["u3", "materialize", "public"]],
        },
      ])
    );
    const user = userEvent.setup();
    renderComponent(<NewPostgresSourceForm />);

    const sourceNameInput = screen.getByLabelText("Name*");
    await user.type(sourceNameInput, "pg_source");
    await user.click(screen.getByLabelText("Select cluster"));
    // wait for cluster options to load
    expect(await screen.findByText("default")).toBeVisible();
    await user.click(screen.getByText("Create new cluster"));
    await user.click(screen.getByLabelText("Select cluster size"));
    await user.click(screen.getByText("3xsmall"));

    const publicationInput = screen.getByLabelText("Publication*");
    await user.type(publicationInput, "mz_source");
    await user.click(screen.getByLabelText("For all tables"));
    await user.click(screen.getByText("Create source"));

    expect(await screen.findByText("Source Details")).toBeVisible();
    expect(location.pathname).toEqual(
      "/sources/u3/materialize/public/pg_source/errors"
    );
  });

  it("shows validation messages for all fields", async () => {
    const user = userEvent.setup();
    renderComponent(<NewPostgresSourceForm />);

    await user.click(screen.getByText("Create source"));

    expect(await screen.findByText("Source name is required.")).toBeVisible();
    expect(await screen.findByText("Cluster is required.")).toBeVisible();
    expect(await screen.findByText("Publication is required.")).toBeVisible();
    expect(await screen.findByText("Table name is required.")).toBeVisible();

    await user.click(screen.getByLabelText("Select cluster"));
    await user.click(screen.getByText("Create new cluster"));

    await user.click(screen.getByText("Create source"));
    expect(await screen.findByText("Cluster size is required.")).toBeVisible();
  });

  it("show validation errors for database and schema if the defaults are missing", async () => {
    server.use(
      // useSchemas
      buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: ["id", "name", "database_id", "database_name"],
        rows: [["u1", "custom_schema", "u1", "big_co"]],
      })
    );
    const user = userEvent.setup();
    renderComponent(<NewPostgresSourceForm />);

    await user.click(screen.getByText("Create source"));

    await waitFor(async () => {
      expect(await screen.findByText("Schema is required.")).toBeVisible();
    });
  });

  it("shows the database error when an unexpected error occurs ", async () => {
    server.use(
      buildSqlQueryHandler([
        {
          type: "CREATE" as const,
          error: {
            message: "some unexpected database error",
            code: ErrorCode.INTERNAL_ERROR,
          },
        },
        {
          type: "SELECT" as const,
          columns: ["id", "database_name", "schema_name"],
          rows: [],
        },
      ])
    );

    const user = userEvent.setup();
    renderComponent(<NewPostgresSourceForm />);

    const sourceNameInput = screen.getByLabelText("Name*");
    await user.type(sourceNameInput, "pg_source");
    await user.click(screen.getByLabelText("Select cluster"));
    // wait for cluster options to load
    expect(await screen.findByText("default")).toBeVisible();
    await user.click(screen.getByText("Create new cluster"));
    await user.click(screen.getByLabelText("Select cluster size"));
    await user.click(screen.getByText("3xsmall"));

    const publicationInput = screen.getByLabelText("Publication*");
    await user.type(publicationInput, "mz_source");
    await user.click(screen.getByLabelText("For all tables"));
    await user.click(screen.getByText("Create source"));

    expect(
      await screen.findByText("some unexpected database error")
    ).toBeVisible();
  });
});
