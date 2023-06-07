import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Switch,
  Text,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { useController, useForm } from "react-hook-form";
import { useRecoilValue_TRANSITION_SUPPORT_UNSTABLE } from "recoil";

import segment from "~/analytics/segment";
import { useAuth } from "~/api/auth";
import { createCsrConnection } from "~/api/materialize/connection/createCsrConnection";
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
import {
  HTTP_URL_WITH_EXPLICIT_ROOT_PATH_REGEX,
  MATERIALIZE_DATABASE_IDENTIFIER_REGEX,
} from "~/api/materialize/validation";
import ErrorBox from "~/components/ErrorBox";
import { FormSection } from "~/components/formComponents";
import InlayBanner from "~/components/InlayBanner";
import ObjectNameInput from "~/components/ObjectNameInput";
import SchemaSelect from "~/components/SchemaSelect";
import SecretsFormControl, {
  createSecretFieldDefaultValues,
  getCreateModeSecretFields,
  SecretField,
} from "~/components/SecretsFormControl";
import useSuccessToast from "~/components/SuccessToast";
import {
  getSecretFromField,
  getSecretOrTextFromField,
  setSecretFieldsFromServerData,
} from "~/forms/secretsFormControlAccessors";
import { currentEnvironmentState } from "~/recoil/environments";
import { MaterializeTheme } from "~/theme";
import { assert } from "~/util";

export interface NewConfluentSchemaRegistryConnectionProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newConnectionId: string) => void;
}

export interface FormState {
  name: string;
  schema: Schema;
  url: string;
  useSsl: boolean;
  username: SecretField<Secret>;
  password: SecretField<Secret>;
  sslCertificateAuthority: SecretField<Secret>;
  sslCertificate: SecretField<Secret>;
  sslKey: SecretField<Secret>;
}

/**
 * A modal that allows users to create a new Confluent Schema Registry connection
 */
const NewConfluentSchemaRegistryConnection = ({
  isOpen,
  onClose,
  onSuccess,
}: NewConfluentSchemaRegistryConnectionProps) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  const toast = useSuccessToast();
  const [isCreating, setIsCreating] = React.useState(false);
  const [generalFormError, setGeneralFormError] = React.useState<
    string | undefined
  >(undefined);
  const {
    user: { accessToken },
  } = useAuth();
  const environment = useRecoilValue_TRANSITION_SUPPORT_UNSTABLE(
    currentEnvironmentState
  );

  const { data: schemas, error: schemasError } = useSchemas();
  const {
    data: secrets,
    refetch: refetchSecrets,
    error: secretsError,
  } = useSecretsCreationFlow();

  const loadingError = schemasError || secretsError;

  const {
    control,
    formState,
    handleSubmit,
    register,
    setError,
    setValue,
    watch,
  } = useForm<FormState>({
    defaultValues: {
      name: "",
      url: "",
      useSsl: false,
      username: createSecretFieldDefaultValues(),
      password: createSecretFieldDefaultValues(),
      sslCertificateAuthority: createSecretFieldDefaultValues(),
      sslCertificate: createSecretFieldDefaultValues(),
      sslKey: createSecretFieldDefaultValues(),
    },
    mode: "onTouched",
  });
  const { field: schemaField } = useController({
    control,
    name: "schema",
    rules: {
      required: "Schema is required.",
    },
  });

  React.useEffect(() => {
    if (!schemas) return;
    if (schemaField.value) return;

    const selected = schemas.find(isDefaultSchema);
    if (selected) {
      schemaField.onChange(selected);
    }
  }, [schemas, schemaField]);

  const useSsl = watch("useSsl");

  const handleValidSubmit = async (values: FormState) => {
    setGeneralFormError(undefined);

    const schemaName = values.schema.name;
    const databaseName = values.schema.databaseName;
    try {
      setIsCreating(true);
      assert(environment?.state === "enabled");

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
        await createCsrConnection({
          params: {
            ...values,
            username: getSecretOrTextFromField(
              values.username,
              databaseName,
              schemaName
            ),
            password: getSecretFromField(
              values.password,
              databaseName,
              schemaName
            ),
            sslKey: getSecretFromField(values.sslKey, databaseName, schemaName),
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

      onSuccess(connectionId);
    } catch (error) {
      if (error instanceof Error) {
        setGeneralFormError(error.message);
      }
    } finally {
      setIsCreating(false);
    }
  };

  if (loadingError) {
    return <ErrorBox />;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(handleValidSubmit)}>
          <ModalHeader fontWeight="500" mb="6">
            New Connection
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pt="2" pb="6" px="0" alignItems="stretch">
            {generalFormError && (
              <InlayBanner
                variant="error"
                label="Error"
                message={generalFormError}
                mb="10"
              />
            )}
            <FormSection
              title="General"
              variant="narrow"
              borderBottom="1px solid"
              borderColor={semanticColors.border.primary}
              pb="2"
              px="6"
            >
              <VStack alignItems="start" spacing="4">
                <FormControl isInvalid={!!formState.errors.name}>
                  <FormLabel htmlFor="name" fontSize="sm">
                    Name
                  </FormLabel>
                  <ObjectNameInput
                    {...register("name", {
                      required: "Connection name is required.",
                      pattern: {
                        message:
                          "Connection name must not include special characters.",
                        value: MATERIALIZE_DATABASE_IDENTIFIER_REGEX,
                      },
                    })}
                    autoFocus
                    placeholder="my_new_connection"
                    autoCorrect="off"
                    size="sm"
                    variant={formState.errors.name ? "error" : "default"}
                  />
                  <FormErrorMessage>
                    {formState.errors.name?.message}
                  </FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!formState.errors.url}>
                  <FormLabel htmlFor="url" fontSize="sm">
                    URL
                  </FormLabel>
                  <ObjectNameInput
                    {...register("url", {
                      required: "Connection URL is required.",
                      pattern: {
                        message:
                          "Connection URL must have a valid protocol, host, and an empty path.",
                        value: HTTP_URL_WITH_EXPLICIT_ROOT_PATH_REGEX,
                      },
                    })}
                    placeholder="https://rp-f00000bar.data.vectorized.cloud:30993/"
                    autoCorrect="off"
                    size="sm"
                    variant={formState.errors.url ? "error" : "default"}
                  />
                  <FormErrorMessage>
                    {formState.errors.url?.message}
                  </FormErrorMessage>
                </FormControl>
                <Accordion
                  allowToggle
                  index={formState.errors.schema ? 0 : undefined}
                  width="100%"
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
                      mt="4"
                      motionProps={{ style: { overflow: "visible" } }}
                    >
                      <FormControl isInvalid={!!formState.errors.schema}>
                        <FormLabel>Schema</FormLabel>
                        <SchemaSelect
                          {...schemaField}
                          schemas={schemas ?? []}
                          variant={
                            formState.errors.schema ? "error" : "default"
                          }
                        />
                        <FormErrorMessage>
                          {formState.errors.schema?.message}
                        </FormErrorMessage>
                      </FormControl>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </VStack>
            </FormSection>
            <FormSection title="Configuration" variant="narrow" px="6">
              <VStack spacing="4">
                <FormControl flexDir="row" display="flex">
                  <Switch {...register("useSsl" as const)} />
                  <FormLabel m="0" ml="2" lineHeight="16px">
                    Use SSL Authentication
                  </FormLabel>
                </FormControl>
                {useSsl && (
                  <>
                    <SecretsFormControl
                      canFieldBeText
                      control={control}
                      register={register}
                      fieldKey="sslCertificateAuthority"
                      fieldLabel="SSL Certificate Authority"
                      selectOptions={secrets ?? []}
                      selectProps={{
                        isClearable: true,
                      }}
                      variant="vertical"
                    />
                    <SecretsFormControl
                      canFieldBeText
                      control={control}
                      register={register}
                      fieldKey="sslCertificate"
                      fieldLabel="SSL Certificate"
                      selectOptions={secrets ?? []}
                      selectRules={{
                        required: "SSL certificate is required.",
                      }}
                      textInputRules={{
                        required: "SSL certificate is required.",
                      }}
                      variant="vertical"
                    />
                    <SecretsFormControl
                      control={control}
                      register={register}
                      fieldKey="sslKey"
                      fieldLabel="SSL Key"
                      selectOptions={secrets ?? []}
                      selectRules={{
                        required: "SSL key is required.",
                      }}
                      textInputRules={{
                        required: "SSL key is required.",
                      }}
                      variant="vertical"
                    />
                  </>
                )}
                <SecretsFormControl
                  canFieldBeText
                  control={control}
                  register={register}
                  fieldKey="username"
                  fieldLabel="Username"
                  selectOptions={secrets ?? []}
                  selectProps={{
                    isClearable: true,
                  }}
                  selectRules={{
                    required: "Username is required.",
                  }}
                  textInputRules={{
                    required: "Username is required.",
                  }}
                  variant="vertical"
                />
                <SecretsFormControl
                  control={control}
                  register={register}
                  fieldKey="password"
                  fieldLabel="Password"
                  selectOptions={secrets ?? []}
                  selectProps={{
                    isClearable: true,
                    menuPlacement: "top",
                  }}
                  selectRules={{
                    required: "Password is required.",
                  }}
                  textInputRules={{
                    required: "Password is required.",
                  }}
                  variant="vertical"
                />
              </VStack>
            </FormSection>
          </ModalBody>
          <ModalFooter>
            <HStack spacing="2">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isDisabled={isCreating}
                onClick={() => segment.track("Create Schema Registry Clicked")}
              >
                Create connection
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default NewConfluentSchemaRegistryConnection;
