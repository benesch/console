import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { format } from "date-fns";
import React from "react";

import { buildUseSqlQueryHandler } from "~/api/mocks/buildSqlQueryHandler";
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

    it("shows an error state when there's an error fetching secrets", async () => {
      const useSecretsHandler = buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: ["id", "name", "database_name", "schema_name", "created_at"],
        rows: [],
        error: "Something went wrong",
      });
      server.use(useSecretsHandler);
      renderComponent(<SecretsList />, {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      });
      expect(
        await screen.findByText("An error occurred loading secrets")
      ).toBeVisible();
    });

    it("shows the empty state when there are no results", async () => {
      renderComponent(<SecretsList />, {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      });
      expect(await screen.findByText("No available secrets")).toBeVisible();
    });

    it("renders secrets", async () => {
      const mockTimestamp = "0";
      const useSecretsHandler = buildUseSqlQueryHandler({
        type: "SELECT" as const,
        columns: ["id", "name", "database_name", "schema_name", "created_at"],
        rows: [
          ["id_1", "name_1", "database_name_1", "schema_name_1", mockTimestamp],
        ],
      });

      server.use(useSecretsHandler);

      renderComponent(<SecretsList />, {
        initializeState: ({ set }) =>
          setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
      });
      expect(await screen.findByText("name_1")).toBeVisible();
      expect(
        await screen.findByText(
          format(new Date(parseInt(mockTimestamp)), "MMM d, yyyy")
        )
      ).toBeVisible();
    });
  });

  describe("Creation flow", () => {
    it("should create a secret successfully and show feedback that the creation was successful", async () => {
      const createSecretHandler = buildUseSqlQueryHandler({
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
      const createSecretHandler = buildUseSqlQueryHandler({
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
        await screen.findByText("A secret with that name already exists.")
      ).toBeVisible();
    });

    it("should show the inlay error banner when an error occurs while trying to create a secret", async () => {
      const createSecretHandler = buildUseSqlQueryHandler({
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
