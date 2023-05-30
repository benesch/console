import {
  FieldValues,
  Path,
  PathValue,
  UseFormSetError,
  UseFormSetValue,
} from "react-hook-form";

import { alreadyExistsError } from "~/api/materialize/parseErrors";
import {
  CreateSecretsError,
  CreateSecretsSuccess,
} from "~/api/materialize/secret/createSecrets";
import { Secret } from "~/api/materialize/secret/useSecrets";
import {
  CreateModeSecretField,
  createSecretFieldDefaultValues,
  SecretField,
} from "~/components/SecretsFormControl";

export function getSecretFromField(
  field: SecretField<Secret>,
  databaseName: string,
  schemaName: string
) {
  if (field.mode === "select") {
    return field.selected
      ? {
          secretName: field.selected.name,
          databaseName: field.selected.databaseName,
          schemaName: field.selected.schemaName,
        }
      : undefined;
  }
  // If secret was just created, use the database and schema used to create it
  if (field.mode === "create") {
    return field.key
      ? {
          secretName: field.key,
          databaseName,
          schemaName,
        }
      : undefined;
  }

  return undefined;
}

export function getSecretOrTextFromField(
  field: SecretField<Secret>,
  databaseName: string,
  schemaName: string
) {
  if (field.mode === "text" && !!field.text) {
    return { secretTextValue: field.text };
  }

  return getSecretFromField(field, databaseName, schemaName);
}

export function setSecretFieldsFromServerData<FormState extends FieldValues>(
  data: CreateSecretsSuccess[],
  errors: CreateSecretsError[],
  fields: [Path<FormState>, CreateModeSecretField][],
  setValue: UseFormSetValue<FormState>,
  setError: UseFormSetError<FormState>
) {
  data.forEach(({ payloadIndex, secret: createdSecret }) => {
    const [fieldKey] = fields[payloadIndex];

    setValue(
      fieldKey,
      createSecretFieldDefaultValues({
        mode: "select",
        selected: createdSecret,
        key: "",
        value: "",
      }) as PathValue<FormState, Path<FormState>>
    );
  });

  errors.forEach(({ payloadIndex, error }) => {
    const [fieldKey] = fields[payloadIndex];
    let errorMessage = error.errorMessage;
    if (alreadyExistsError(errorMessage)) {
      errorMessage = "A secret with that name already exists.";
    }

    setError(`${fieldKey}.key` as Path<FormState>, {
      message: errorMessage,
    });
  });
}
