import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { ReactElement } from "react";

import { buildSqlQueryHandler } from "~/api/mocks/buildSqlQueryHandler";
import server from "~/api/mocks/server";
import {
  createProviderWrapper,
  healthyEnvironment,
  setFakeEnvironment,
} from "~/test/utils";

import NewReplicaModal from "./NewReplicaModal";

jest.mock("~/api/auth");

const Wrapper = createProviderWrapper({
  initializeState: ({ set }) =>
    setFakeEnvironment(set, "AWS/us-east-1", healthyEnvironment),
});

const renderComponent = (element: ReactElement) => {
  return render(<Wrapper>{element}</Wrapper>);
};

describe("NewReplicaForm", () => {
  it("creates a new replica", async () => {
    server.use(buildSqlQueryHandler([{ type: "CREATE" as const }]));
    const user = userEvent.setup();
    const closeMock = jest.fn();
    const submitMock = jest.fn();
    renderComponent(
      <NewReplicaModal
        clusterName="default"
        isOpen
        onClose={closeMock}
        onSubmit={submitMock}
      />
    );

    const nameInput = screen.getByLabelText("Name");
    await user.type(nameInput, "new_replica");

    await user.click(screen.getByText("Create replica"));

    expect(submitMock).toHaveBeenCalled();
  });

  it("requires a name", async () => {
    server.use(buildSqlQueryHandler([{ type: "CREATE" as const }]));
    const user = userEvent.setup();
    const closeMock = jest.fn();
    const submitMock = jest.fn();
    renderComponent(
      <NewReplicaModal
        clusterName="default"
        isOpen
        onClose={closeMock}
        onSubmit={submitMock}
      />
    );

    await user.click(screen.getByText("Create replica"));

    expect(screen.getByText("Name is required.")).toBeVisible();
  });
});
