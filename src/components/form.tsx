/**
 * @module
 * Formik–Chakra UI integration.
 */

import {
  Button,
  ButtonProps,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
} from "@chakra-ui/react";
import { FieldHookConfig, useField, useFormikContext } from "formik";
import React from "react";

export type TextFieldProps = FieldHookConfig<string> & {
  /** The label to use above the text input. */
  label: string;
  /** The font size of the label and size of the text input. */
  size?: string;
};

/**
 * A text field in a Formik form.
 *
 * This component must be used inside a `Formik` element.
 */
export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, size, ...props }, ref) => {
    const [field, meta] = useField(props);
    return (
      <FormControl isInvalid={meta.touched && !!meta.error}>
        <FormLabel htmlFor={props.name} fontSize={size}>
          {label}
        </FormLabel>
        <Input size={size} ref={ref} {...field} />
        <FormErrorMessage>{meta.error}</FormErrorMessage>
      </FormControl>
    );
  }
);

export type SelectFieldProps = FieldHookConfig<string> & {
  /** The label to use above the select input. */
  label: string;
  /** The font size of the label and size of the select input. */
  size?: string;
};

/**
 * A select field in a Formik form.
 *
 * This component must be used inside a `Formik` element.
 */
export const SelectField = React.forwardRef<
  HTMLSelectElement,
  SelectFieldProps
>(({ label, size, ...props }, ref) => {
  const [field, meta] = useField(props);

  return (
    <FormControl
      isInvalid={meta.touched && !!meta.error}
      isDisabled={props.disabled}
    >
      <FormLabel htmlFor={props.name} fontSize={size}>
        {label}
      </FormLabel>
      <Select size={size} ref={ref} {...field}>
        {props.children}
      </Select>
      <FormErrorMessage>{meta.error}</FormErrorMessage>
    </FormControl>
  );
});

export function SubmitButton(props: ButtonProps) {
  const formik = useFormikContext();
  return (
    <Button
      type="submit"
      colorScheme="purple"
      isLoading={formik.isSubmitting}
      {...props}
    >
      {props.children}
    </Button>
  );
}
