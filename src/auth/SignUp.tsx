import { gql, useApolloClient } from "@apollo/client";
import React, { useState } from "react";
import { Button, Form, Message, Segment } from "semantic-ui-react";

import { useFormik } from "formik";
import * as yup from "yup";
import { useUser } from "./AuthContext";
import { Link } from "react-router-dom";
import Code from "./Code";
import PasswordInput from "./PasswordInput";

const ALLOWED_EMAIL = gql`
  query AllowedEmail($email: String!) {
    allowedEmail(email: $email)
  }
`;

const validationSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Must be at least 8 characters long")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match"),
  acceptTerms: yup.bool().isTrue("You must accept the Terms and Conditions"),
});

function SignUp() {
  const apolloClient = useApolloClient();
  const { signUp } = useUser();
  const [step, setStep] = useState("SIGNUP");

  const [error, setError] = useState("");

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const data = await apolloClient.query({
          query: ALLOWED_EMAIL,
          variables: { email: values.email },
        });
        if (!data.data.allowedEmail) {
          throw { message: "Only invited users are permitted right now." };
        }
        await signUp(values.email, values.password);
        setStep("CODE");
      } catch (e) {
        setError(e.message);
      }
    },
  });

  if (step === "SIGNUP") {
    const tosLabel = (
      <React.Fragment>
        <label>
          I agree to the{" "}
          <a
            href="https://materialize.com/terms-and-conditions/"
            onClick={(e) => e.stopPropagation()}
          >
            Terms and Conditions
          </a>
          .
        </label>
      </React.Fragment>
    );
    return (
      <React.Fragment>
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
              type="text"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && formik.errors.email}
              label="Email"
            />
            <PasswordInput form={formik} />

            <Form.Checkbox
              required
              name="acceptTerms"
              onChange={() =>
                formik.setFieldValue("acceptTerms", !formik.values.acceptTerms)
              }
              error={formik.touched.acceptTerms && formik.errors.acceptTerms}
              label={tosLabel}
            />

            <Message error header="Signup failed" content={error} />

            <Button color="violet" fluid size="large">
              Sign up
            </Button>
          </Segment>
        </Form>
        <Message>
          Already have an account? <Link to="/login">Log in.</Link>
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

export default SignUp;
