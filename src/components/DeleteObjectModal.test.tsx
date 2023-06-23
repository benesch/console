import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { buildUseSqlQueryHandler } from "~/api/mocks/buildSqlQueryHandler";
import server from "~/api/mocks/server";
import { renderComponent } from "~/test/utils";

import DeleteObjectModal from "./DeleteObjectModal";

jest.mock("~/api/auth");

let closeMock: () => void;
let successMock: () => void;
const dbObject = {
  name: "some_secret",
  schemaName: "public",
  databaseName: "default",
  id: "u1",
};

describe("DeleteObjectModal", () => {
  beforeEach(() => {
    closeMock = jest.fn();
    successMock = jest.fn();
  });

  describe("when there are no dependencies", () => {
    beforeEach(() => {
      server.use(
        // useObjectDependencies
        buildUseSqlQueryHandler({
          type: "SELECT" as const,
          columns: ["count"],
          rows: [["0"]],
        }),
        // DROP SECRET
        buildUseSqlQueryHandler({
          type: "DROP" as const,
        })
      );
    });

    it("shows a validation error when the name is not entered correctly", async () => {
      renderComponent(
        <DeleteObjectModal
          isOpen
          onClose={closeMock}
          onSuccess={successMock}
          dbObject={dbObject}
          objectType="SECRET"
        />
      );
      const user = userEvent.setup();

      // wait for the modal to open
      await waitFor(() =>
        expect(screen.getByText("Delete some_secret")).toBeVisible()
      );
      // wait for the dependency count to load
      expect(
        await screen.findByText(
          "This action will permanently delete some_secret and can not be undone."
        )
      ).toBeVisible();
      user.click(screen.getByRole("button", { name: "Delete Object" }));
      expect(await screen.findByText("Object name is required.")).toBeVisible();

      const input = screen.getByLabelText("To confirm, type some_secret below");
      await act(() => user.type(input, "wrong name"));
      user.click(screen.getByRole("button", { name: "Delete Object" }));
      expect(screen.getByText("Object name must match exactly.")).toBeVisible();
    });

    it("shows the delete confirmation and closes the model when complete", async () => {
      renderComponent(
        <DeleteObjectModal
          isOpen
          onClose={closeMock}
          onSuccess={successMock}
          dbObject={dbObject}
          objectType="SECRET"
        />
      );
      const user = userEvent.setup();

      // wait for the modal to open
      await waitFor(() =>
        expect(screen.getByText("Delete some_secret")).toBeVisible()
      );
      // wait for the dependency count to load
      expect(
        await screen.findByText(
          "This action will permanently delete some_secret and can not be undone."
        )
      ).toBeVisible();
      const input = screen.getByLabelText("To confirm, type some_secret below");
      await user.type(input, "some_secret");
      user.click(screen.getByRole("button", { name: "Delete Object" }));
      await waitFor(() => expect(successMock).toHaveBeenCalled());
      expect(closeMock).toHaveBeenCalled();
    });
  });

  describe("when there are dependencies", () => {
    beforeEach(() => {
      server.use(
        // useObjectDependencies
        buildUseSqlQueryHandler({
          type: "SELECT" as const,
          columns: ["count"],
          rows: [["3"]],
        }),
        // DROP SECRET
        buildUseSqlQueryHandler({
          type: "DROP" as const,
        })
      );
    });

    it("shows the number of dependencies and requires confirmation", async () => {
      renderComponent(
        <DeleteObjectModal
          isOpen
          onClose={closeMock}
          onSuccess={successMock}
          dbObject={dbObject}
          objectType="SECRET"
        />
      );
      const user = userEvent.setup();

      // wait for the modal to open
      await waitFor(() =>
        expect(screen.getByText("Delete some_secret")).toBeVisible()
      );
      // wait for the dependency count to load
      expect(
        await screen.findByText("some_secret has 3 dependents")
      ).toBeVisible();
      await user.click(
        screen.getByRole("button", {
          name: "Yes, I am sure I want to delete all dependents",
        })
      );
      const input = screen.getByLabelText("To confirm, type some_secret below");
      await user.type(input, "some_secret");
      user.click(screen.getByRole("button", { name: "Delete Object" }));
      await waitFor(() => expect(successMock).toHaveBeenCalled());
      expect(closeMock).toHaveBeenCalled();
    });
  });
});
