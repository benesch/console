import React from "react";
import { Form } from "semantic-ui-react";
import PasswordStrengthBar from "react-password-strength-bar";
import { FormikErrors, FormikTouched } from "formik";

interface PasswordInputFields {
  password: string;
  confirmPassword: string;
}

interface PasswordInputProps {
  form: {
    values: PasswordInputFields;
    touched: FormikTouched<PasswordInputFields>;
    errors: FormikErrors<PasswordInputFields>;
    handleChange: any;
  };
}

function PasswordInput(props: PasswordInputProps) {
  const form = props.form;
  return (
    <React.Fragment>
      <Form.Input
        required
        name="password"
        type="password"
        value={form.values.password}
        onChange={form.handleChange}
        error={form.touched.password && form.errors.password}
        label="Password"
      />
      <PasswordStrengthBar
        password={form.values.password}
        minLength={8}
        scoreWords={["very weak", "weak", "okay", "good", "strong"]}
        style={{ marginBottom: "1em" }}
      />
      <Form.Input
        required
        name="confirmPassword"
        type="password"
        value={form.values.confirmPassword}
        onChange={form.handleChange}
        error={form.touched.confirmPassword && form.errors.confirmPassword}
        label="Confirm password"
      />
    </React.Fragment>
  );
}

export default PasswordInput;
