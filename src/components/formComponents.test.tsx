import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Form, Formik } from "formik";
import React from "react";

import { TextField } from "./formComponents";

describe("TextField", () => {
  jest.useFakeTimers();
  it("Should respect maximum length of the field", () => {
    const out = render(
      <Formik
        initialValues={{
          foo: "",
        }}
        onSubmit={(values, actions) => {
          // not used
        }}
      >
        {(form) => (
          <Form>
            <TextField name="foo" label="Name" maxLength={8} />
          </Form>
        )}
      </Formik>
    );
    const input = out.getByLabelText("Name") as HTMLInputElement;

    // TextField should allow text up to the limit:
    userEvent.type(input, "12345678");
    expect(input.value).toBe("12345678");

    // When we try to type 9 characters, it should stop after 8:
    userEvent.type(input, "{selectall}{del}");
    userEvent.type(input, "987654321");
    expect(input.value).toBe("98765432");
  });
});
