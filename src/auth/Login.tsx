import React, { useState } from "react";
import { Button, Form, Message, Segment } from "semantic-ui-react";

import { useFormik } from "formik";
import * as yup from "yup";

import { useUser } from "./AuthContext";
import { useHistory, Link } from "react-router-dom";

import Code from "./Code";

const validationSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Must be at least 8 characters long")
    .required("Password is required"),
});

function Login() {
  const { login, authTokenRejected } = useUser();
  const history = useHistory();

  const [error, setError] = useState("");
  const [step, setStep] = useState("LOGIN");

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const user = await login(values.email, values.password);
        if (user && user.challengeName) {
          history.push("/new-password");
        } else if (user) {
          history.push("/instances");
        }
      } catch (e) {
        if (e.name === "UserNotConfirmedException") {
          setStep("CODE");
        } else {
          setError(e.message);
        }
      }
    },
  });

  if (step === "LOGIN") {
    return (
      <React.Fragment>
        <Message error hidden={!authTokenRejected}>
          <Message.Header>Session expired or invalid</Message.Header>
          <p>
            You were automatically logged out because your session expired or
            was otherwise invalidated.
          </p>

          <p>
            Please try logging in again. If the problem persists,{" "}
            <a href="mailto:support@materialize.com">contact support</a>.
          </p>
        </Message>

        <Form
          size="large"
          error={Boolean(error)}
          loading={formik.isSubmitting}
          onSubmit={formik.handleSubmit}
        >
          <Segment>
            <Form.Input
              required
              name="email"
              id="login-form-email"
              type="text"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && formik.errors.email}
              label="Email"
            />
            <Form.Field>
              <Link to="/forgot-password" style={{ float: "right" }}>
                Forgot password?
              </Link>
              <label htmlFor="login-form-password">Password</label>
              <Form.Input
                required
                name="password"
                id="login-form-password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.touched.password && formik.errors.password}
              />
            </Form.Field>

            <Message error header="Login failed" content={error} />

            <Button color="violet" fluid size="large">
              Log in
            </Button>
          </Segment>
        </Form>
        <Message>
          Don't have an account? <Link to="/signup">Sign up.</Link>
        </Message>
      </React.Fragment>
    );
  } else if (step === "CODE") {
    return (
      <Code
        email={formik.values.email}
        password={formik.values.password}
        destination="/instances"
      />
    );
  }
  return <div>Logged in!</div>;
}

export default Login;
