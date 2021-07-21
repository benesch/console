import React, { useState } from "react";
import { Button, Form, Message, Segment } from "semantic-ui-react";

import { useHistory } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import { Cognito, useAuth } from "./AuthProvider";
import PasswordInput from "./PasswordInput";

function ForgotPassword() {
  const auth = useAuth();
  const history = useHistory();

  const [error, setError] = useState("");
  const [sentEmail, setSentEmail] = useState(false);

  const requestEmailForm = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: yup.object({
      email: yup
        .string()
        .email("Enter a valid email")
        .required("Email is required"),
    }),
    onSubmit: async (values) => {
      try {
        await Cognito.forgotPassword(values.email);
        setSentEmail(true);
      } catch (e) {
        setError(e.message);
      }
    },
  });

  const changeForm = useFormik({
    initialValues: {
      code: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: yup.object({
      password: yup
        .string()
        .min(8, "Must be at least 8 characters long")
        .required("Password is required"),
      confirmPassword: yup
        .string()
        .oneOf([yup.ref("password")], "Passwords must match"),
    }),
    onSubmit: async (values) => {
      try {
        await Cognito.forgotPasswordSubmit(
          requestEmailForm.values.email,
          values.code,
          values.password
        );
        setSentEmail(true);
        await auth.login(requestEmailForm.values.email, values.password);
        history.push("/");
      } catch (e) {
        setError(e.message);
      }
    },
  });

  if (sentEmail) {
    return (
      <Form
        size="large"
        error={Boolean(error)}
        loading={changeForm.isSubmitting}
        onSubmit={changeForm.handleSubmit}
      >
        <Segment>
          <p>
            If you have an account, an authentication code has been sent to your
            email. Enter it below to change your password.
          </p>
          <Form.Input
            required
            name="email"
            type="text"
            value={requestEmailForm.values.email}
            disabled
            label="Email"
          />
          <Form.Input
            required
            name="code"
            type="text"
            value={changeForm.values.code}
            onChange={changeForm.handleChange}
            label="Authentication Code"
          />
          <PasswordInput form={changeForm} />

          <Message error header="Change password error" content={error} />

          <Button color="violet" fluid size="large">
            Change password
          </Button>
        </Segment>
      </Form>
    );
  }

  return (
    <Form
      size="large"
      error={Boolean(error)}
      loading={requestEmailForm.isSubmitting}
      onSubmit={requestEmailForm.handleSubmit}
    >
      <Segment>
        <p>Enter your email to receive a code to reset your password.</p>
        <Form.Input
          required
          name="email"
          type="text"
          value={requestEmailForm.values.email}
          onChange={requestEmailForm.handleChange}
          error={
            requestEmailForm.touched.email && requestEmailForm.errors.email
          }
          label="Email"
        />

        <Message error header="Forgot password error" content={error} />

        <Button color="violet" fluid size="large">
          Request new password
        </Button>
      </Segment>
    </Form>
  );
}

export default ForgotPassword;
