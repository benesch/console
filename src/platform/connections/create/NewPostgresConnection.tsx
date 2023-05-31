import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Image,
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
import createPostgresConnection from "~/api/materialize/connection/createPostgresConnection";
import { alreadyExistsError } from "~/api/materialize/parseErrors";
import createSecrets from "~/api/materialize/secret/createSecrets";
import {
  Secret,
  useSecretsCreationFlow,
} from "~/api/materialize/secret/useSecrets";
import useSchemas, {
  isDefaultSchema,
  Schema,
} from "~/api/materialize/useSchemas";
import { MATERIALIZE_DATABASE_IDENTIFIER_REGEX } from "~/api/materialize/validation";
import ErrorBox from "~/components/ErrorBox";
import {
  FormContainer,
  FormInfoBox,
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
  getCreateModeSecretFields,
  SecretField,
} from "~/components/SecretsFormControl";
import useSuccessToast from "~/components/SuccessToast";
import {
  getSecretOrTextFromField,
  setSecretFieldsFromServerData,
} from "~/forms/secretsFormControlUtils";
import awsLogo from "~/img/aws-logo.svg";
import postgresLogo from "~/img/postgres-logo.svg";
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

    try {
      setIsCreating(true);

      assert(environment?.state === "enabled");
      const schemaName = values.schema.name;
      const databaseName = values.schema.databaseName;

      const createModeSecretFields = getCreateModeSecretFields(values);

      const secretsToBeCreated = createModeSecretFields.map(
        ([_, fieldValue]) => {
          return {
            name: fieldValue.key,
            value: fieldValue.value,
            databaseName,
            schemaName,
          };
        }
      );

      const { errors: createSecretsErrors, data: createSecretsData } =
        await createSecrets({
          environment,
          accessToken,
          secrets: secretsToBeCreated,
        });

      await refetchSecrets();

      setSecretFieldsFromServerData(
        createSecretsData,
        createSecretsErrors,
        createModeSecretFields,
        setValue,
        setError
      );

      if (createSecretsErrors.length > 0) {
        return;
      }

      const { error: createConnectionError, data: createConnectionData } =
        await createPostgresConnection({
          params: {
            ...values,
            password: getSecretOrTextFromField(
              values.password,
              databaseName,
              schemaName
            ),
            sslMode: values.sslMode?.name,
            sslKey: getSecretOrTextFromField(
              values.sslKey,
              databaseName,
              schemaName
            ),
            sslCertificate: getSecretOrTextFromField(
              values.sslCertificate,
              databaseName,
              schemaName
            ),
            sslCertificateAuthority: getSecretOrTextFromField(
              values.sslCertificateAuthority,
              databaseName,
              schemaName
            ),
            databaseName,
            schemaName,
          },
          environment,
          accessToken,
        });

      if (createConnectionError) {
        if (alreadyExistsError(createConnectionError.errorMessage)) {
          setError("name", {
            message: "A connection with that name already exists.",
          });
        } else {
          setGeneralFormError(createConnectionError.errorMessage);
        }
        return;
      }

      const { connectionId } = createConnectionData;
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
          <FormContainer
            title="Connection information"
            aside={
              <FormInfoBox>
                <Text
                  textStyle="text-ui-med"
                  color={semanticColors.foreground.primary}
                  mb={2}
                >
                  Need help connecting to Postgres?
                </Text>
                <Text
                  textStyle="text-base"
                  color={semanticColors.foreground.secondary}
                  maxW={{ md: "40ch" }}
                  mb={6}
                >
                  Check out our step-by-step guides or reach out to the team for
                  help with setting up your Postgres connection.
                </Text>
                <HStack>
                  <Button
                    as="a"
                    variant="outline"
                    size="sm"
                    height="10"
                    px="4"
                    leftIcon={<Image src={postgresLogo} height="4" width="4" />}
                    href="https://materialize.com/docs/connect-sources/cdc-postgres-direct/"
                    target="_blank"
                    flexShrink={0}
                  >
                    PostgreSQL CDC
                  </Button>
                  <Button
                    as="a"
                    variant="outline"
                    size="sm"
                    height="10"
                    px="4"
                    leftIcon={<Image src={awsLogo} height="4" width="4" />}
                    href="https://materialize.com/docs/connect-sources/cdc-postgres-direct/#aws-rds-t0"
                    target="_blank"
                    flexShrink={0}
                  >
                    AWS RDS
                  </Button>
                </HStack>
              </FormInfoBox>
            }
          >
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
              <VStack mt="2" spacing="6" alignItems="start">
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
