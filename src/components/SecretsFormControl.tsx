import { CloseIcon } from "@chakra-ui/icons";
import {
  Button,
  FormControl,
  HStack,
  Input,
  InputProps,
  useTheme,
} from "@chakra-ui/react";
import React from "react";
import {
  Control,
  Controller,
  FieldValues,
  InternalFieldErrors,
  Path,
  RegisterOptions,
  useController,
  UseFormRegister,
  useFormState,
  useWatch,
} from "react-hook-form";

import { MATERIALIZE_DATABASE_IDENTIFIER_REGEX } from "~/api/materialize/validation";
import { MaterializeTheme } from "~/theme";

import { InlineLabeledInput } from "./formComponents";
import ObjectNameInput from "./ObjectNameInput";
import SearchableSelect, {
  SearchableSelectProps,
  SelectOption,
} from "./SearchableSelect";

const TextOrSecretInputMessage = ({
  onLinkClick,
  isTextInput = false,
}: {
  onLinkClick?: () => void;
  isTextInput?: boolean;
}) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  return (
    <>
      If you prefer,{" "}
      <Button
        variant="link"
        fontSize="12px"
        lineHeight="16px"
        fontWeight={400}
        color={semanticColors.accent.brightPurple}
        onClick={onLinkClick}
      >
        {isTextInput ? "use a secret" : "use plain text"}
      </Button>
      .
    </>
  );
};

/**
 * Binds to react-hook-form's form object and toggles between a text input, selecting a secret,
 * and creating a secret via an "Add Item" option.
 *
 * Example usage:
 *
 * ```
 * const {control, register} = useForm({
 *  defaultValues: {
 *    exampleField: createSelectField()
 *  }
 * });
 * ...
 *
 * <SecretsFormControl
 *  control={control}
 *  register={register}
 *  fieldName="exampleField"
 *  canFieldBeText
 * />
 * ```
 *
 * exampleField will look like the following depending on SecretsFormControl mode:
 *
 * Text Input:
 * ```
 * exampleField: {
 *   mode: "text",
 *   text: "..."
 * }
 * ```
 *
 * Selecting a secret:
 * ```
 * exampleField: {
 *   mode: "select",
 *   selected: SelectOption
 * }
 *```
 *
 * Creating a secret:
 * ```
 * exampleField: {
 *   mode: "create",
 *   key: "..."
 *   value: "..."
 * }
 *```
 */

export type SecretsFormControlProps<
  FormState extends FieldValues,
  Option extends SelectOption = SelectOption
> = {
  // Control prop given by react-hook-form
  control: Control<FormState>;
  // Register prop given by react-hook-form
  register: UseFormRegister<FormState>;
  // Key of field in react-hook-form's form state object
  fieldKey: string;
  fieldLabel?: string;
  // Props given to the select input
  selectProps?: Partial<SearchableSelectProps>;
  // Rules given to the controller of the select input
  selectRules?: RegisterOptions;
  // List of options rendered in the Select input
  selectOptions?: Option[];
  // If true, allows user to toggle between using a text value or a secret value for the input
  canFieldBeText?: boolean;
  textInputProps?: Partial<InputProps>;
  textInputRules?: RegisterOptions;
};

export type Mode = "text" | "select" | "create";

export type SecretField<Option extends SelectOption = SelectOption> = {
  mode: Mode;
  key?: string;
  value?: string;
  selected?: Option;
  text?: string;
};

export const SecretsFormControl = <FormState extends FieldValues>(
  props: SecretsFormControlProps<FormState>
) => {
  const {
    control,
    register,
    fieldKey,
    fieldLabel,
    selectOptions,
    textInputProps,
    textInputRules,
    selectProps,
    selectRules,
    canFieldBeText = false,
  } = props;
  const { errors } = useFormState({
    control,
  });
  const fieldError = errors[fieldKey] as InternalFieldErrors;

  const {
    field: { value: mode, onChange: setMode },
  } = useController({
    control,
    name: `${fieldKey}.mode` as Path<FormState>,
  });

  const createSecretKey = useWatch({
    name: `${fieldKey}.key` as Path<FormState>,
    control,
  });

  type FieldProps = {
    isInvalid?: boolean;
    error?: string;
    message?: React.ReactNode;
  };

  function getFieldPropsByMode(): Partial<Record<Mode, FieldProps>> {
    const selectFieldProps = {
      isInvalid: !!fieldError?.selected,
      error: fieldError?.selected?.message,
    };

    const createFieldProps = {
      isInvalid: !!fieldError?.key || !!fieldError?.value,
      error: fieldError?.key?.message || fieldError?.value?.message,
      message:
        createSecretKey && createSecretKey.length > 0
          ? `A new secret named ${createSecretKey} will be created.`
          : undefined,
    };

    if (!canFieldBeText) {
      return {
        select: selectFieldProps,
        create: createFieldProps,
      };
    }

    return {
      text: {
        isInvalid: !!fieldError?.text,
        error: fieldError?.text?.message,
        message: (
          <TextOrSecretInputMessage
            onLinkClick={() => setMode("select")}
            isTextInput
          />
        ),
      },
      select: {
        ...selectFieldProps,
        message: (
          <TextOrSecretInputMessage onLinkClick={() => setMode("text")} />
        ),
      },
      create: createFieldProps,
    };
  }

  const { isInvalid, error, message } = getFieldPropsByMode()[mode] ?? {};

  return (
    <FormControl isInvalid={isInvalid}>
      <InlineLabeledInput
        label={fieldLabel ?? ""}
        error={error}
        message={message}
      >
        {mode === "text" ? (
          <Input
            {...register(`${fieldKey}.text` as Path<FormState>, {
              shouldUnregister: true,
              ...textInputRules,
            })}
            autoCorrect="off"
            size="sm"
            variant={fieldError?.text ? "error" : "default"}
            {...textInputProps}
          />
        ) : mode === "select" ? (
          <Controller
            control={control}
            name={`${fieldKey}.selected` as Path<FormState>}
            rules={{ ...selectRules }}
            shouldUnregister={true}
            render={({ field }) => (
              <SearchableSelect
                {...field}
                ariaLabel="Select a secret"
                placeholder="Select one"
                options={selectOptions ?? []}
                displayAddNewItem
                addNewItemLabel="Create new secret"
                onAddNewItem={() => {
                  setMode("create");
                }}
                {...selectProps}
              />
            )}
          />
        ) : mode === "create" ? (
          <HStack alignItems="start">
            <ObjectNameInput
              {...register(`${fieldKey}.key` as Path<FormState>, {
                required: "Key is required.",
                pattern: {
                  value: MATERIALIZE_DATABASE_IDENTIFIER_REGEX,
                  message: "Key must not include special characters.",
                },
                shouldUnregister: true,
              })}
              placeholder="Key"
              autoCorrect="off"
              size="sm"
              variant={fieldError?.key ? "error" : "default"}
            />

            <Input
              {...register(`${fieldKey}.value` as Path<FormState>, {
                required: "Value is required.",
                shouldUnregister: true,
              })}
              placeholder="Value"
              autoCorrect="off"
              size="sm"
              variant={fieldError?.value ? "error" : "default"}
            />
            <Button
              variant="borderless"
              height="8"
              minWidth="8"
              width="8"
              onClick={() => setMode("select")}
            >
              <CloseIcon height="8px" width="8px" />
            </Button>
          </HStack>
        ) : null}
      </InlineLabeledInput>
    </FormControl>
  );
};

export function createSecretFieldDefaultValues(initialMode?: Mode) {
  return {
    selected: undefined,
    key: undefined,
    value: undefined,
    text: undefined,
    mode: initialMode ?? "select",
  };
}

type SelectModeSecretField<Option extends SelectOption> = {
  mode: "select";
  selected: Option;
};

type TextModeSecretField = {
  mode: "text";
  text: string;
};

type CreateModeSecretField = {
  mode: "create";
  key: string;
  value: string;
};

export function isSelectMode<Option extends SelectOption>(
  field: SecretField<Option>
): field is SelectModeSecretField<Option> {
  return field.mode === "select";
}

export function isCreateMode(
  field: SecretField<Option>
): field is CreateModeSecretField {
  return field.mode === "create";
}

export function isTextMode<Option extends SelectOption>(
  field: SecretField<Option>
): field is TextModeSecretField {
  return field.mode === "text";
}

export function getSecretFieldValueByMode<Option extends SelectOption>(
  field: SecretField<Option>
) {
  if (isSelectMode(field)) {
    return field;
  } else if (isCreateMode(field)) {
    return field;
  } else if (isTextMode(field)) {
    return field;
  }
}

export default SecretsFormControl;
