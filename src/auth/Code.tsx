import React, { useState } from "react";
import { Button, Divider, Form, Message, Segment } from "semantic-ui-react";

import { useHistory } from "react-router-dom";
import { useFormik } from "formik";
import { Cognito, useAuth } from "./AuthProvider";

type CodeProps = {
  email: string;
  password: string;
  destination: string;
};

function Code({ email, password, destination }: CodeProps) {
  const auth = useAuth();
  const history = useHistory();

  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      code: "",
    },
    onSubmit: async (values) => {
      try {
        await Cognito.confirmSignUp(email, values.code);
        await auth.login(email, password);
        history.push(destination);
      } catch (e) {
        setError(e.message);
      }
    },
  });

  const handleResendCode = async () => {
    try {
      setResendLoading(true);
      await Cognito.resendSignUp(email);
    } catch (e) {
      setError(e.message);
    }
    setResendLoading(false);
  };

  return (
    <Form
      size="large"
      error={Boolean(error)}
      loading={formik.isSubmitting}
      onSubmit={formik.handleSubmit}
    >
      <Segment>
        <p>An authentication code has been sent to your email.</p>
        <Form.Input
          required
          name="code"
          type="text"
          value={formik.values.code}
          onChange={formik.handleChange}
          label="Authentication Code"
        />

        <Message error header="Authentication Error" content={error} />

        <Button color="violet" fluid size="large">
          Submit
        </Button>
        <Divider hidden />
        <Button
          basic
          compact
          color="violet"
          fluid
          loading={resendLoading}
          onClick={handleResendCode}
          type="button"
        >
          Resend Activation Code
        </Button>
      </Segment>
    </Form>
  );
}

export default Code;
