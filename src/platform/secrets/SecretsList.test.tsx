import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { genUseSqlQueryHandler } from "~/api/mocks/genSqlQueryHandler";
import server from "~/api/mocks/server";
import {
  healthyEnvironment,
  renderComponent,
  setFakeEnvironment,
} from "~/test/utils";

import SecretsList from "./SecretsList";

jest.mock("~/api/auth");

describe("SecretsList", () => {
  describe("Secrets list page", () => {
    it("shows a spinner initially", async () => {
      renderComponent(<SecretsList />, {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      });

      expect(await screen.findByText("Secrets")).toBeVisible();
      expect(await screen.findByTestId("loading-spinner")).toBeVisible();
    });

    it("shows the empty state when there are no results", async () => {
      renderComponent(<SecretsList />, {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      });
      expect(await screen.findByText("No available secrets")).toBeVisible();
    });

    it("renders secrets", async () => {
      const useSecretsHandler = genUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: ["id", "name", "database_name", "schema_name"],
        rows: [["id_1", "name_1", "database_name_1", "schema_name_1"]],
      });

      server.use(useSecretsHandler);

      renderComponent(<SecretsList />, {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      });
      expect(await screen.findByText("name_1")).toBeVisible();
    });
  });

  describe("Creation flow", () => {
    it("should create a secret successfully and show feedback that the creation was successful", async () => {
      const createSecretHandler = genUseSqlQueryHandler({
        type: "CREATE" as const,
      });
      server.use(createSecretHandler);

      const user = userEvent.setup();

      renderComponent(<SecretsList />, {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      });
      await user.click(screen.getByText("New secret"));

      const nameInput = screen.getByLabelText("Name");
      const valueInput = screen.getByLabelText("Value");

      await user.type(nameInput, "test_secret");

      await user.type(valueInput, "value");
      await user.click(screen.getByText("Create secret"));

      expect(
        await screen.findByText("created successfully")
      ).toBeInTheDocument();
    });

    it("should show an error when trying to create a secret and the secret already exists", async () => {
      const createSecretHandler = genUseSqlQueryHandler({
        type: "CREATE" as const,
        error: "catalog item 'test_1' already exists",
      });

      server.use(createSecretHandler);

      const user = userEvent.setup();

      renderComponent(<SecretsList />, {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      });

      await user.click(screen.getByText("New secret"));

      const nameInput = screen.getByLabelText("Name");
      const valueInput = screen.getByLabelText("Value");

      await user.type(nameInput, "test_secret");

      await user.type(valueInput, "value");
      await user.click(screen.getByText("Create secret"));

      expect(
        await screen.findByText("A secret with the name test_1 already exists.")
      ).toBeVisible();
    });

    it("should show the inlay error banner when an error occurs while trying to create a secret", async () => {
      const createSecretHandler = genUseSqlQueryHandler({
        type: "CREATE" as const,
        error: "Something went wrong.",
      });

      server.use(createSecretHandler);

      const user = userEvent.setup();

      renderComponent(<SecretsList />, {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      });

      await user.click(screen.getByText("New secret"));

      const nameInput = screen.getByLabelText("Name");
      const valueInput = screen.getByLabelText("Value");

      await user.type(nameInput, "test_secret");

      await user.type(valueInput, "value");
      await user.click(screen.getByText("Create secret"));

      expect(
        await screen.findByText(
          "There was an error creating a secret key. Please try again."
        )
      ).toBeVisible();
    });
  });
});
