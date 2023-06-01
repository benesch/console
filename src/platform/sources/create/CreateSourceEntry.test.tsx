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

import CreateSourceEntry from "./CreateSourceEntry";

jest.mock("~/api/auth");

const Wrapper = createProviderWrapper({
  initializeState: ({ set }) =>
    setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
});

const renderComponent = (element: ReactElement) => {
  return render(
    <Wrapper>
      <Routes>
        <Route path="/sources/new/*">
          <Route path=":type" element={<div>Create Postgres source</div>} />
          <Route path="connection" element={element} />
        </Route>
      </Routes>
    </Wrapper>
  );
};

describe("NewPostgresSource", () => {
  beforeEach(() => {
    server.use(
      buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: ["id", "name", "schema_name", "database_name", "type"],
        rows: [
          ["u1", "pg_connection", "default", "materialize", "postgres"],
          ["u2", "kafka_connection", "default", "materialize", "kafka"],
        ],
      })
    );
    history.pushState(undefined, "", "/sources/new/connection");
  });

  it("selecting a postgres connection redirects to the create postgres source form", async () => {
    const user = userEvent.setup();
    renderComponent(<CreateSourceEntry />);

    expect(await screen.findByText("pg_connection")).toBeVisible();
    await user.click(screen.getByText("pg_connection"));

    expect(await screen.findByText("Create Postgres source")).toBeVisible();
    expect(location.pathname).toEqual("/sources/new/postgres");
    expect(location.search).toEqual("?connectionId=u1");
  });

  it("selecting a kafka connection redirects to the create postgres source form", async () => {
    const user = userEvent.setup();
    renderComponent(<CreateSourceEntry />);

    expect(await screen.findByText("kafka_connection")).toBeVisible();
    await user.click(screen.getByText("kafka_connection"));

    expect(await screen.findByText("Create Postgres source")).toBeVisible();
    expect(location.pathname).toEqual("/sources/new/kafka");
    expect(location.search).toEqual("?connectionId=u2");
  });
});
