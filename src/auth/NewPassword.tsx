import React from "react";

import { Formik, Form, Field } from "formik";
import { AuthStatus, Cognito, useAuth } from "./AuthProvider";

function NewPassword() {
  const auth = useAuth();
  return (
    <Formik
      initialValues={{
        password: "",
        repeatPassword: "",
      }}
      onSubmit={async (values) => {
        if (
          values.password === values.repeatPassword &&
          auth.state.status == AuthStatus.LoggedIn
        ) {
          await Cognito.completeNewPassword(auth.state.user, values.password);
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
