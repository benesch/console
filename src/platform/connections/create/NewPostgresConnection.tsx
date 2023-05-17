import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalContent,
  Switch,
  Text,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { Controller, useController, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useRecoilValue_TRANSITION_SUPPORT_UNSTABLE } from "recoil";

import { useAuth } from "~/api/auth";
import { attachNamespace } from "~/api/materialize";
import createPostgresConnectionStatement from "~/api/materialize/createConnectionStatement";
import { alreadyExistsError } from "~/api/materialize/parseErrors";
import useSchemas, {
  isDefaultSchema,
  Schema,
} from "~/api/materialize/useSchemas";
import {
  createSecretQueryBuilder,
  normalizeSecretsRow,
  Secret,
  useSecretsCreationFlow,
} from "~/api/materialize/useSecrets";
import { MATERIALIZE_DATABASE_IDENTIFIER_REGEX } from "~/api/materialize/validation";
import { executeSql } from "~/api/materialized";
import ErrorBox from "~/components/ErrorBox";
import {
  FormContainer,
  FormSection,
  FormTopBar,
  InlineLabeledInput,
} from "~/components/formComponents";
import InlayBanner from "~/components/InlayBanner";
import ObjectNameInput from "~/components/ObjectNameInput";
import SchemaSelect from "~/components/SchemaSelect";
import SearchableSelect, { SelectOption } from "~/components/SearchableSelect";
import SecretsFormControl, {
  createSecretFieldDefaultValues,
  isSecretField,
  SecretField,
} from "~/components/SecretsFormControl";
import useSuccessToast from "~/components/SuccessToast";
import { currentEnvironmentState } from "~/recoil/environments";
import { MaterializeTheme } from "~/theme";
import { assert } from "~/util";

type FormState = {
  name: string;
  schema: Schema;
  host: string;
  pgDatabaseName: string;
  port: string;

  user: string;
  password: SecretField<Secret>;
  sslMode: SelectOption;
  sslKey: SecretField<Secret>;
  sslCertificate: SecretField<Secret>;
  sslCertificateAuthority: SecretField<Secret>;
};

const defaultFormState = {
  name: "",
  host: "",
  pgDatabaseName: "",
  port: "",
  user: "",
  password: createSecretFieldDefaultValues(),
  sslMode: undefined,
  sslKey: createSecretFieldDefaultValues(),
  sslCertificate: createSecretFieldDefaultValues(),
  sslCertificateAuthority: createSecretFieldDefaultValues(),
};

const SSL_MODE_OPTIONS = ["require", "verify-ca", "verify-full"].map((val) => ({
  id: val,
  name: val,
}));

const NewPostgresConnection = () => {
  const [generalFormError, setGeneralFormError] = useState<
    string | undefined
  >();
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const toast = useSuccessToast();
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  const { data: schemas, error: schemasError } = useSchemas();
  const {
    data: secrets,
    error: secretsError,
    refetch: refetchSecrets,
  } = useSecretsCreationFlow();

  const {
    user: { accessToken },
  } = useAuth();
  const environment = useRecoilValue_TRANSITION_SUPPORT_UNSTABLE(
    currentEnvironmentState
  );

  const loadingError = schemasError || secretsError;

  const [enableCertAuth, setEnableCertAuth] = useState(false);

  const {
    formState,
    handleSubmit,
    register,
    setError,
    control,
    watch,
    setValue,
  } = useForm<FormState>({
    defaultValues: defaultFormState,
    mode: "onTouched",
  });

  const { field: schemaField } = useController({
    control,
    name: "schema",
    rules: {
      required: "Schema is required.",
    },
  });

  const handleValidSubmit = async (values: FormState) => {
    setGeneralFormError(undefined);

    type CreateModeSecretField = Required<
      Pick<SecretField, "mode" | "key" | "value">
    >;

    const secretsToBeCreated = Object.entries(values).filter(
      ([_, field]) => isSecretField(field) && field.mode === "create"
    ) as [keyof FormState, CreateModeSecretField][];

    try {
      setIsCreating(true);

      assert(environment?.state === "enabled");
      const responses = await Promise.all(
        secretsToBeCreated.map(([_, fieldValue]) => {
          return executeSql(
            environment,
            {
              queries: [
                {
                  query: createSecretQueryBuilder({
                    name: fieldValue.key,
                    value: fieldValue.value,
                    schemaName: values.schema.name,
                    databaseName: values.schema.databaseName,
                  }),
                  params: [],
                },
              ],
              cluster: "mz_introspection",
            },
            accessToken
          );
        })
      );

      const refetchedSecrets = await refetchSecrets();

      assert(refetchedSecrets);

      let errorCreatingSecrets = false;

      responses.forEach((response, i) => {
        const [fieldName, fieldValue] = secretsToBeCreated[i];
        if ("errorMessage" in response) {
          let errorMessage = response.errorMessage;
          if (alreadyExistsError(response.errorMessage)) {
            errorMessage = "A secret with that name already exists.";
          }

          setError(`${fieldName}.key` as keyof FormState, {
            message: errorMessage,
          });
          errorCreatingSecrets = true;
          return;
        }

        const [refetchedSecretsResults] = refetchedSecrets;
        const { getColumnByName } = refetchedSecretsResults;
        assert(getColumnByName);

        const createdSecret = refetchedSecretsResults.rows.find((row) => {
          const name = getColumnByName(row, "name");
          const schemaName = getColumnByName(row, "schema_name");
          const databaseName = getColumnByName(row, "database_name");

          return (
            fieldValue.key === name &&
            schemaName === values.schema.name &&
            databaseName === values.schema.databaseName
          );
        });

        if (!createdSecret) {
          return;
        }

        setValue(fieldName, {
          ...createSecretFieldDefaultValues("select"),
          selected: normalizeSecretsRow(createdSecret, getColumnByName),
        });
      });

      if (errorCreatingSecrets) {
        return;
      }

      const getSecretFieldValue = (field: SecretField<Secret>) => {
        if (field.mode === "text") {
          return field.text
            ? {
                isText: true,
                secretValue: field.text,
              }
            : undefined;
        }

        if (field.mode === "select") {
          return field.selected
            ? {
                secretValue: attachNamespace(
                  field.selected.name,
                  field.selected.databaseName,
                  field.selected.schemaName
                ),
              }
            : undefined;
        }

        if (field.mode === "create") {
          return field.key
            ? {
                secretValue: attachNamespace(
                  field.key,
                  values.schema.databaseName,
                  values.schema.name
                ),
              }
            : undefined;
        }
      };

      const createConnectionQuery = createPostgresConnectionStatement({
        ...values,
        password: getSecretFieldValue(values.password),
        sslMode: values.sslMode?.name,
        sslKey: getSecretFieldValue(values.sslKey),
        sslCertificate: getSecretFieldValue(values.sslCertificate),
        sslCertificateAuthority: getSecretFieldValue(
          values.sslCertificateAuthority
        ),
        databaseName: values.schema.databaseName,
        schemaName: values.schema.name,
      });

      const createConnectionResponses = await executeSql(
        environment,
        {
          queries: [
            { query: createConnectionQuery, params: [] },
            {
              query: `SELECT c.id
                          FROM mz_connections c
                          INNER JOIN mz_schemas sc ON sc.id = c.schema_id
                          INNER JOIN mz_databases d ON d.id = sc.database_id
                          WHERE c.name = $1
                          AND sc.name=$2
                          AND d.name=$3;`,
              params: [
                values.name,
                values.schema.name,
                values.schema.databaseName,
              ],
            },
          ],
          cluster: "mz_introspection",
        },
        accessToken
      );

      if ("errorMessage" in createConnectionResponses) {
        if (alreadyExistsError(createConnectionResponses.errorMessage)) {
          setError("name", {
            message: "A connection with that name already exists.",
          });
        } else {
          setGeneralFormError(createConnectionResponses.errorMessage);
        }
        return;
      }

      assert(createConnectionResponses.results);

      const [_, selectConnectionResponse] = createConnectionResponses.results;
      const [connectionId] = selectConnectionResponse.rows[0];
      toast({
        description: (
          <>
            <Text color={semanticColors.foreground.primary} as="span">
              {values.name}{" "}
            </Text>
            created successfully
          </>
        ),
      });

      navigate(
        `../../show-connections-created?connectionType=postgres&connectionId=${connectionId}`
      );
    } catch (e) {
      if (e instanceof Error) {
        setGeneralFormError(e.message);
      }
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    if (!schemas) return;
    if (schemaField.value) return;

    const selected = schemas.find(isDefaultSchema);
    if (selected) {
      schemaField.onChange(selected);
    }
  }, [schemas, schemaField]);

  const selectedSSLMode = watch("sslMode")?.name;

  if (loadingError) {
    return <ErrorBox />;
  }

  return (
    <Modal
      isOpen
      onClose={() => {
        navigate("../connection");
      }}
      variant="fullscreen"
      closeOnEsc={false}
    >
      <ModalContent>
        <form onSubmit={handleSubmit(handleValidSubmit)}>
          <FormTopBar
            title="Create a Postgres connection"
            backButtonHref="../connection"
          >
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isDisabled={isCreating}
            >
              Create connection
            </Button>
          </FormTopBar>
          <FormContainer title="Connection information">
            {generalFormError && (
              <InlayBanner
                variant="error"
                label="Error"
                message={generalFormError}
                mb="10"
              />
            )}
            <FormSection title="General">
              <FormControl isInvalid={!!formState.errors.name}>
                <InlineLabeledInput
                  label="Name"
                  error={formState.errors.name?.message}
                  message="Alphanumeric characters and underscores only."
                >
                  <ObjectNameInput
                    {...register("name", {
                      required: "Connection name is required.",
                      pattern: {
                        value: MATERIALIZE_DATABASE_IDENTIFIER_REGEX,
                        message:
                          "Connection name must not include special characters.",
                      },
                    })}
                    autoFocus
                    placeholder="My new connection"
                    autoCorrect="off"
                    size="sm"
                    variant={formState.errors.name ? "error" : "default"}
                  />
                </InlineLabeledInput>
              </FormControl>
              <Accordion
                allowToggle
                index={formState.errors.schema ? 0 : undefined}
              >
                <AccordionItem>
                  <AccordionButton
                    color={semanticColors.accent.brightPurple}
                    py="2"
                  >
                    <Text textStyle="text-ui-med">Additional Options</Text>
                    <AccordionIcon ml="2" />
                  </AccordionButton>
                  <AccordionPanel
                    motionProps={{ style: { overflow: "visible" } }}
                  >
                    <FormControl isInvalid={!!formState.errors.schema}>
                      <InlineLabeledInput
                        label="Schema"
                        error={formState.errors.schema?.message}
                      >
                        <SchemaSelect
                          {...schemaField}
                          schemas={schemas ?? []}
                        />
                      </InlineLabeledInput>
                    </FormControl>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </FormSection>

            <FormSection title="Connection details">
              <VStack spacing="6" alignItems="start">
                <FormControl isInvalid={!!formState.errors.host}>
                  <InlineLabeledInput
                    label="Host"
                    error={formState.errors.host?.message}
                  >
                    <Input
                      {...register("host", {
                        required: "Host is required.",
                      })}
                      placeholder="db.us-east-1.rds.amazonaws.com"
                      autoCorrect="off"
                      size="sm"
                      variant={formState.errors.host ? "error" : "default"}
                    />
                  </InlineLabeledInput>
                </FormControl>
                <FormControl isInvalid={!!formState.errors.pgDatabaseName}>
                  <InlineLabeledInput
                    label="Database"
                    error={formState.errors.pgDatabaseName?.message}
                  >
                    <Input
                      {...register("pgDatabaseName", {
                        required: "Database name is required.",
                      })}
                      placeholder="postgres"
                      autoCorrect="off"
                      size="sm"
                      variant={
                        formState.errors.pgDatabaseName ? "error" : "default"
                      }
                    />
                  </InlineLabeledInput>
                </FormControl>
                <FormControl isInvalid={!!formState.errors.port}>
                  <InlineLabeledInput
                    label="Port"
                    error={formState.errors.port?.message}
                  >
                    <Input
                      {...register("port")}
                      placeholder="5432"
                      autoCorrect="off"
                      size="sm"
                      variant={formState.errors.port ? "error" : "default"}
                      type="number"
                    />
                  </InlineLabeledInput>
                </FormControl>
              </VStack>
            </FormSection>
            <FormSection title="Authentication">
              <VStack spacing="6" alignItems="start">
                <FormControl flexDir="row" display="flex">
                  <Switch
                    onChange={() => setEnableCertAuth((prev) => !prev)}
                    isChecked={enableCertAuth}
                  />
                  <FormLabel m="0" ml="2" lineHeight="16px">
                    SSL Authentication
                  </FormLabel>
                </FormControl>
                <FormControl isInvalid={!!formState.errors.user}>
                  <InlineLabeledInput
                    label="User"
                    error={formState.errors.user?.message}
                  >
                    <Input
                      {...register("user", {
                        required: "Database username is required.",
                      })}
                      placeholder="user"
                      autoCorrect="off"
                      size="sm"
                      variant={formState.errors.user ? "error" : "default"}
                    />
                  </InlineLabeledInput>
                </FormControl>

                <SecretsFormControl
                  control={control}
                  register={register}
                  fieldKey="password"
                  fieldLabel="Password"
                  selectOptions={secrets ?? []}
                  selectProps={{
                    menuPlacement: "top",
                    isClearable: true,
                  }}
                />

                {enableCertAuth && (
                  <>
                    <SecretsFormControl
                      control={control}
                      register={register}
                      fieldKey="sslKey"
                      fieldLabel="SSL Key"
                      selectOptions={secrets ?? []}
                      selectProps={{
                        menuPlacement: "top",
                      }}
                      selectRules={{
                        required: "SSL key is required.",
                      }}
                      textInputRules={{
                        required: "SSL key is required.",
                      }}
                    />
                    <SecretsFormControl
                      control={control}
                      register={register}
                      fieldKey="sslCertificate"
                      fieldLabel="Certificate"
                      selectOptions={secrets ?? []}
                      selectProps={{
                        menuPlacement: "top",
                      }}
                      selectRules={{
                        required: "Certificate is required.",
                      }}
                      canFieldBeText
                      textInputProps={{
                        placeholder: "-----BEGIN CERTIFICATE...",
                      }}
                      textInputRules={{
                        required: "Certificate is required.",
                      }}
                    />
                  </>
                )}
                <Controller
                  control={control}
                  name="sslMode"
                  rules={{
                    required: enableCertAuth ? "SSL Mode is required." : false,
                  }}
                  render={({ field, fieldState }) => (
                    <FormControl isInvalid={!!fieldState.error}>
                      <InlineLabeledInput
                        label="SSL Mode"
                        error={fieldState.error?.message}
                      >
                        <SearchableSelect
                          ariaLabel="SSL Mode"
                          placeholder="Select one"
                          options={SSL_MODE_OPTIONS}
                          isSearchable={false}
                          menuPlacement="top"
                          isClearable={!enableCertAuth}
                          {...field}
                        />
                      </InlineLabeledInput>
                    </FormControl>
                  )}
                />

                {(selectedSSLMode === "verify-ca" ||
                  selectedSSLMode === "verify-full") && (
                  <SecretsFormControl
                    control={control}
                    register={register}
                    fieldKey="sslCertificateAuthority"
                    fieldLabel="SSL Certificate Authority"
                    selectOptions={secrets ?? []}
                    selectProps={{
                      menuPlacement: "top",
                    }}
                    selectRules={{
                      required: "Certificate authority is required.",
                    }}
                    textInputRules={{
                      required: "Certificate authority is required.",
                    }}
                    canFieldBeText
                    textInputProps={{
                      placeholder: "-----BEGIN CERTIFICATE...",
                    }}
                  />
                )}
              </VStack>
            </FormSection>
          </FormContainer>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default NewPostgresConnection;
