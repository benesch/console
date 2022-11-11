import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Form, Formik } from "formik";
import React from "react";

import { TextField } from "./formComponents";

describe("TextField", () => {
  it("Should respect maximum length of the field", async () => {
    render(
      <Formik
        initialValues={{
          foo: "",
        }}
        onSubmit={() => {
          // not used
        }}
      >
        {() => (
          <Form>
            <TextField id="foo" name="foo" label="Name" maxLength={8} />
          </Form>
        )}
      </Formik>
    );
    const input = screen.getByLabelText("Name");

    // TextField should allow text up to the limit:
    await userEvent.type(input, "12345678");
    expect(input).toHaveValue("12345678");

    // When we try to type 9 characters, it should stop after 8:
    await userEvent.clear(input);
    await userEvent.type(input, "987654321");
    expect(input).toHaveValue("98765432");
  });
});
