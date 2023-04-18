import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { ChangeEvent } from "react";

import ObjectNameInput from "./ObjectNameInput";

describe("ObjectNameInput", () => {
  it("replaces spaces with underscores", async () => {
    const user = userEvent.setup();
    // Even if we pass a custom onChange function, spaces should still be replaced
    const mockHandleChange = jest.fn() as (
      e: ChangeEvent<HTMLInputElement>
    ) => void;
    const result = render(
      <ObjectNameInput name="name" onChange={mockHandleChange} />
    );
    const input = result.getByRole("textbox") as HTMLInputElement;
    user.type(input, "test value");
    await waitFor(() => {
      expect(result.getByRole("textbox")).toHaveValue("test_value");
    });
    expect(mockHandleChange).toHaveBeenCalled();
  });
});
