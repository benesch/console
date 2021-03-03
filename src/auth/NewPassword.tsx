import React from "react";

import { Formik, Form, Field } from "formik";
import { useUser } from "./AuthContext";

function NewPassword() {
  const { newPassword } = useUser();
  return (
    <Formik
      initialValues={{
        password: "",
        repeatPassword: "",
      }}
      onSubmit={async (values) => {
        if (values.password === values.repeatPassword) {
          await newPassword(values.password);
        }
      }}
    >
      <Form>
        <label>
          <span>password</span>
          <Field type="password" name="password" />
        </label>
        <label>
          <span>repeat password</span>
          <Field type="password" name="repeatPassword" />
        </label>
        <button type="submit">Submit</button>
      </Form>
    </Formik>
  );
}

export default NewPassword;
