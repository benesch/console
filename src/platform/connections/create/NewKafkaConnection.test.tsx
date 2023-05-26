import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";
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

import NewKafkaConnection from "./NewKafkaConnection";

jest.mock("~/api/auth");

jest.setTimeout(20_000);

const Wrapper = createProviderWrapper({
  initializeState: ({ set }) =>
    setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
});

const renderComponent = (element: ReactElement) => {
  return render(
    <Wrapper>
      <Routes>
        <Route path="connections/*">
          <Route
            path="show-connections-created"
            element={<div>Connection List</div>}
          />
          <Route path="new/*">
            <Route path="kafka" element={element} />
          </Route>
        </Route>
      </Routes>
    </Wrapper>
  );
};

async function fillRequiredFields(user: UserEvent) {
  const connectionNameInput = screen.getByLabelText("Name");

  await user.type(connectionNameInput, "name");
  const brokerInput = screen.getByLabelText("Broker host 1");
  await user.type(brokerInput, "broker1:9092");
  const usernameInput = screen.getByLabelText("Username");
  await user.type(usernameInput, "user");

  await user.click(screen.getByLabelText("Password"));
  await user.click(screen.getByText("secret_1"));
}

describe("NewKafkaConnection", () => {
  beforeEach(() => {
    server.use(
      // useSchemas
      buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: ["id", "name", "database_id", "database_name"],
        rows: [["u1", "public", "u1", "materialize"]],
      }),
      // useSecretsCreationFlow
      buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: ["id", "name", "database_name", "schema_name"],
        rows: [["u1", "secret_1", "materialize", "public"]],
      })
    );
    history.pushState(undefined, "", "/connections/new/kafka");
  });

  it("creates a connection successfully and redirects to connections list page", async () => {
    // createSecret
    server.use(buildSqlQueryHandler([{ type: "CREATE" as const }]));

    // createKafkaConnection
    server.use(
      buildSqlQueryHandler([
        { type: "CREATE" as const },
        {
          type: "SELECT" as const,
          columns: ["id"],
          rows: [["u3"]],
        },
      ])
    );

    const user = userEvent.setup();
    renderComponent(<NewKafkaConnection />);

    await fillRequiredFields(user);
    await user.click(screen.getByText("Create connection"));

    expect(await screen.findByText("Connection List")).toBeVisible();

    expect(location.pathname).toEqual("/connections/show-connections-created");

    expect(location.search).toEqual("?connectionType=kafka&connectionId=u3");
  });

  it("changes select value to created secret when secret creation succeeds but connection creation fails", async () => {
    // createSecret
    server.use(
      buildSqlQueryHandler([
        { type: "CREATE" as const },
        {
          type: "SELECT" as const,
          columns: ["id", "name", "database_name", "schema_name"],
          rows: [["u3", "secret_2", "materialize", "public"]],
        },
      ])
    );

    // createKafkaConnection
    server.use(
      buildSqlQueryHandler([
        {
          type: "CREATE" as const,
          error: {
            message: "Something went wrong",
            code: ErrorCode.INTERNAL_ERROR,
          },
        },
        {
          type: "SELECT" as const,
          columns: ["id"],
          rows: [["u5"]],
        },
      ])
    );

    const user = userEvent.setup();
    renderComponent(<NewKafkaConnection />);

    await fillRequiredFields(user);

    await user.click(screen.getByLabelText("Password"));
    await user.click(screen.getByText("Create new secret"));
    const createSecretKeyInput = screen.getByLabelText("Password secret key");
    const createSecretValueInput = screen.getByLabelText(
      "Password secret value"
    );

    await user.type(createSecretKeyInput, "secret_2");
    await user.type(createSecretValueInput, "some_value");

    // intercept refetch to include new secret
    server.use(
      buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: ["id", "name", "database_name", "schema_name"],
        rows: [
          ["u1", "secret_1", "materialize", "public"],
          ["u3", "secret_2", "materialize", "public"],
        ],
      })
    );

    await user.click(screen.getByText("Create connection"));
    // Ensure the field goes from create mode to select mode
    expect(
      await screen.findByRole("combobox", { name: "Password" })
    ).toBeVisible();
    expect(screen.getByText("secret_2")).toBeVisible();
  });

  it("shows an error when secrets fail to load", async () => {
    // useSecrets
    server.use(
      buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: ["id", "name", "database_id", "database_name"],
        rows: [],
        error: {
          message: "secrets failed to load",
          code: ErrorCode.INTERNAL_ERROR,
        },
      })
    );

    renderComponent(<NewKafkaConnection />);
    expect(
      await screen.findByText("An unexpected error has occured")
    ).toBeVisible();
  });

  it("shows an error state when schemas fail to load", async () => {
    // useSchemas
    server.use(
      buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: ["id", "name", "database_id", "database_name"],
        rows: [],
        error: {
          message: "schemas failed to load",
          code: ErrorCode.INTERNAL_ERROR,
        },
      })
    );

    renderComponent(<NewKafkaConnection />);
    expect(
      await screen.findByText("An unexpected error has occured")
    ).toBeVisible();
  });

  it("shows required validation messages when using SASL authentication", async () => {
    const user = userEvent.setup();
    renderComponent(<NewKafkaConnection />);
    await user.click(screen.getByText("Create connection"));
    expect(
      await screen.findByText("Connection name is required.")
    ).toBeVisible();
    expect(await screen.findByText("Broker is required.")).toBeVisible();
    expect(await screen.findByText("Username is required.")).toBeVisible();
    expect(await screen.findByText("Password is required.")).toBeVisible();
  });

  it("shows required validation messages when using SSL authentication", async () => {
    const user = userEvent.setup();
    renderComponent(<NewKafkaConnection />);
    await user.click(screen.getByRole("tab", { name: "SSL" }));
    await user.click(screen.getByText("Create connection"));

    expect(await screen.findByText("Key is required.")).toBeVisible();
    expect(await screen.findByText("Certificate is required.")).toBeVisible();
  });

  it("shows required validation messages when using no authentication", async () => {
    const user = userEvent.setup();
    renderComponent(<NewKafkaConnection />);
    await user.click(screen.getByText("Create connection"));
    expect(
      await screen.findByText("Connection name is required.")
    ).toBeVisible();
    expect(await screen.findByText("Broker is required.")).toBeVisible();
  });

  it("shows validation errors for schema field if the default schema is missing", async () => {
    server.use(
      // useSchemas
      buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: ["id", "name", "database_id", "database_name"],
        rows: [["u1", "custom_schema", "u1", "big_co"]],
      })
    );
    const user = userEvent.setup();
    renderComponent(<NewKafkaConnection />);
    await user.click(screen.getByText("Create connection"));

    await waitFor(async () => {
      expect(await screen.findByText("Schema is required.")).toBeVisible();
    });
  });

  it("shows an error when an unexpected connection creation error occurs", async () => {
    server.use(
      // createKafkaConnection
      buildSqlQueryHandler([
        {
          type: "CREATE" as const,
          error: {
            message: "Some unexpected connection creation error",
            code: ErrorCode.INTERNAL_ERROR,
          },
        },
        {
          type: "SELECT" as const,
          columns: ["id"],
          rows: [],
        },
      ])
    );

    const user = userEvent.setup();
    renderComponent(<NewKafkaConnection />);

    await fillRequiredFields(user);
    await user.click(screen.getByText("Create connection"));
    expect(
      await screen.findByText("Some unexpected connection creation error")
    ).toBeVisible();
  });

  it("shows an error when an unexpected secret creation error occurs", async () => {
    // createSecret
    server.use(
      buildSqlQueryHandler([
        {
          type: "CREATE" as const,
          error: {
            message: "some unexpected secret creation error",
            code: ErrorCode.INTERNAL_ERROR,
          },
        },
        {
          type: "SELECT" as const,
          columns: ["id", "name", "database_name", "schema_name"],
          rows: [],
          error: {
            message: "secret does not exist",
            code: ErrorCode.INTERNAL_ERROR,
          },
        },
      ])
    );
    const user = userEvent.setup();
    renderComponent(<NewKafkaConnection />);
    await fillRequiredFields(user);

    await user.click(screen.getByLabelText("Password"));

    await user.click(screen.getByText("Create new secret"));
    const createSecretKeyInput = screen.getByLabelText("Password secret key");
    const createSecretValueInput = screen.getByLabelText(
      "Password secret value"
    );

    await user.type(createSecretKeyInput, "test_secret_1");
    await user.type(createSecretValueInput, "some_value");
    await user.click(screen.getByText("Create connection"));

    await waitFor(async () => {
      expect(
        await screen.findByText("some unexpected secret creation error")
      ).toBeVisible();
    });
  });
});
