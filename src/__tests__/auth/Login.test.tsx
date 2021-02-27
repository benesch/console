import React from "react";
import Login from "../../auth/Login";

import { render, act, screen } from "@testing-library/react";
import { UserProvider } from "../../auth/AuthContext";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";

jest.mock("aws-amplify");

describe("<Login>", () => {
  test("it renders", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <UserProvider
            region="us-east-2"
            userPoolId="us-east-2_GbM7D8ZVg"
            userPoolWebClientId="7st072o8h1lhfj66mjf9vbcauo"
          >
            <Login />
          </UserProvider>
        </MemoryRouter>
      );
    });

    expect(screen.getByLabelText("Email")).toBeTruthy();
    expect(screen.getByLabelText("Password")).toBeTruthy();
  });

  test.skip("it renders", async () => {
    render(
      <MemoryRouter>
        <UserProvider
          region="us-east-2"
          userPoolId="us-east-2_GbM7D8ZVg"
          userPoolWebClientId="7st072o8h1lhfj66mjf9vbcauo"
        >
          <Login />
        </UserProvider>
      </MemoryRouter>
    );

    userEvent.type(screen.getByLabelText("Email"), "user");
    userEvent.type(screen.getByLabelText("Password"), "correct");
    userEvent.click(screen.getByRole("button", { name: /submit/i }));
  });
});
