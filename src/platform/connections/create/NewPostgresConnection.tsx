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

import segment from "~/analytics/segment";
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
import { DocsCallout, DocsLink } from "~/components/DocsCallout";
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
} from "~/forms/secretsFormControlAccessors";
import { currentEnvironmentState } from "~/recoil/environments";
import { AwsAuroraLogoIcon } from "~/svg/AwsAuroraLogoIcon";
import AwsLogoIcon from "~/svg/AwsLogoIcon";
import { GcpLogoIcon } from "~/svg/GcpLogoIcon";
import { MsftLogoIcon } from "~/svg/MsftLogoIcon";
import PostgresLogoIcon from "~/svg/PostgresLogoIcon";
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

const postgresConnectionDocs: DocsLink[] = [
  {
    label: "Amazon RDS",
    href: "https://materialize.com/docs/ingest-data/postgres-amazon-rds/",
    icon: <AwsLogoIcon height="4" width="4" />,
  },
  {
    label: "Amazon Aurora",
    href: "https://materialize.com/docs/ingest-data/postgres-amazon-aurora/",
    icon: <AwsAuroraLogoIcon height="4" width="4" />,
  },
  {
    label: "Azure DB",
    href: "https://materialize.com/docs/ingest-data/postgres-azure-db/",
    icon: <MsftLogoIcon height="4" width="4" />,
  },
  {
    label: "Google Cloud SQL",
    href: "https://materialize.com/docs/ingest-data/postgres-google-cloud-sql/",
    icon: <GcpLogoIcon height="4" width="4" />,
  },
  {
    label: "Self-hosted PostgreSQL",
    href: "https://materialize.com/docs/ingest-data/postgres-self-hosted/",
    icon: <PostgresLogoIcon height="4" width="4" />,
  },
];

const FormAside = () => {
  return (
    <FormInfoBox maxW={{ md: "40ch" }}>
      <DocsCallout
        title="Need help connecting to your Postgres source?"
        description="Check out our step-by-step guides or reach out to the team for help with
        setting up your Postgres connection."
        docsLinks={postgresConnectionDocs}
      />
    </FormInfoBox>
  );
};

export const NewPostgresConnectionForm = () => {
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
          onClick={() =>
            segment.track("Create Connection Clicked", { type: "postgres" })
          }
        >
          Create connection
        </Button>
      </FormTopBar>
      <FormContainer title="Connection information" aside={<FormAside />}>
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
              <AccordionPanel motionProps={{ style: { overflow: "visible" } }}>
                <FormControl isInvalid={!!formState.errors.schema}>
                  <InlineLabeledInput
                    label="Schema"
                    error={formState.errors.schema?.message}
                  >
                    <SchemaSelect
                      {...schemaField}
                      schemas={schemas ?? []}
                      variant={formState.errors.schema ? "error" : "default"}
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
                      variant={fieldState.error ? "error" : "default"}
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
  );
};

const NewPostgresConnection = () => {
  const navigate = useNavigate();

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
        <NewPostgresConnectionForm />
      </ModalContent>
    </Modal>
  );
};

export default NewPostgresConnection;
