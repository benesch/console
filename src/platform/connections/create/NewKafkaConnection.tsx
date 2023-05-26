import { CloseIcon } from "@chakra-ui/icons";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  FormControl,
  FormErrorMessage,
  HStack,
  Input,
  Modal,
  ModalContent,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import React, { useEffect, useMemo, useState } from "react";
import { useController, useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useRecoilValue_TRANSITION_SUPPORT_UNSTABLE } from "recoil";

import { useAuth } from "~/api/auth";
import createKafkaConnection, {
  SASL_MECHANISMS,
  SASLMechanism,
} from "~/api/materialize/connection/createKafkaConnection";
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
  FormSection,
  FormTopBar,
  GutterContainer,
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
  getSecretFromField,
  getSecretOrTextFromField,
  setSecretFieldsFromServerData,
} from "~/forms/secretsFormControlUtils";
import { currentEnvironmentState } from "~/recoil/environments";
import PlusCircleIcon from "~/svg/PlusCircleIcon";
import { MaterializeTheme } from "~/theme";
import { assert } from "~/util";

type Broker = {
  hostPort: string;
  availabilityZone: string;
  port: string;
};

type FormState = {
  name: string;
  schema: Schema;

  networkSecurity: SelectOption;
  brokers: Broker[];

  saslMechanism: SelectOption;
  saslUsername: SecretField<Secret>;
  saslPassword: SecretField<Secret>;

  sslKey: SecretField<Secret>;
  sslCertificate: SecretField<Secret>;
  sslCertificateAuthority: SecretField<Secret>;
};

const defaultFormState = {
  name: "",
  brokers: [
    {
      hostPort: "",
      availabilityZone: "",
      port: "",
    },
  ],
  saslMechanism: {
    id: "PLAIN",
    name: SASL_MECHANISMS.PLAIN,
  },
  saslUsername: createSecretFieldDefaultValues({ mode: "text" }),
  saslPassword: createSecretFieldDefaultValues(),
  sslKey: createSecretFieldDefaultValues(),
  sslCertificate: createSecretFieldDefaultValues(),
  sslCertificateAuthority: createSecretFieldDefaultValues(),
};

const AUTH_MODE = {
  SASL: 0,
  SSL: 1,
  none: 2,
};

function getAuthParamFromFormState(authMode: number, values: FormState) {
  const schemaName = values.schema.name;
  const databaseName = values.schema.databaseName;

  const sslCertificateAuthority = getSecretOrTextFromField(
    values.sslCertificateAuthority,
    databaseName,
    schemaName
  );

  if (authMode === AUTH_MODE.SASL) {
    const saslUsername = getSecretOrTextFromField(
      values.saslUsername,
      databaseName,
      schemaName
    );

    const saslPassword = getSecretFromField(
      values.saslPassword,
      databaseName,
      schemaName
    );

    assert(saslUsername);
    assert(saslPassword);
    assert(values.saslMechanism);

    return {
      type: "SASL" as const,
      saslMechanism: values.saslMechanism.id as SASLMechanism,
      saslUsername,
      saslPassword,
      sslCertificateAuthority,
    };
  }

  if (authMode === AUTH_MODE.SSL) {
    const sslCertificate = getSecretOrTextFromField(
      values.sslCertificate,
      databaseName,
      schemaName
    );
    const sslKey = getSecretFromField(
      values.sslCertificate,
      databaseName,
      schemaName
    );

    assert(sslCertificate);
    assert(sslKey);

    return {
      type: "SSL" as const,
      sslCertificate,
      sslKey,
      sslCertificateAuthority,
    };
  }
}

const NewKafkaConnection = () => {
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

  const [authMode, setAuthMode] = useState(AUTH_MODE.SASL);

  const { formState, handleSubmit, register, setError, control, setValue } =
    useForm<FormState>({
      defaultValues: defaultFormState,
      mode: "onTouched",
    });

  const {
    fields: brokerFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "brokers",
  });

  const { field: saslMechanismField } = useController({
    control,
    name: "saslMechanism",
  });

  const { field: schemaField } = useController({
    control,
    name: "schema",
    rules: {
      required: "Schema is required.",
    },
  });

  const saslMechanismOptions = useMemo(
    () => Object.entries(SASL_MECHANISMS).map(([k, v]) => ({ id: k, name: v })),
    []
  );

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

      const brokers = values.brokers.map(({ hostPort }) => ({
        type: "basic" as const,
        hostPort,
      }));

      const { error: createConnectionError, data: createConnectionData } =
        await createKafkaConnection({
          params: {
            name: values.name,
            databaseName,
            schemaName,
            auth: getAuthParamFromFormState(authMode, values),
            brokers,
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
        `../../show-connections-created?connectionType=kafka&connectionId=${connectionId}`
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
            title="Create a Kafka connection"
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
              <VStack spacing="4" width="100%">
                {brokerFields.map((field, index) => (
                  <InlineLabeledInput
                    key={field.id}
                    label={
                      brokerFields.length > 1 ? `Broker ${index + 1}` : "Broker"
                    }
                  >
                    <HStack alignItems="start">
                      <FormControl
                        isInvalid={
                          !!formState.errors.brokers?.[index]?.hostPort
                        }
                      >
                        <Input
                          {...register(`brokers.${index}.hostPort` as const, {
                            required: "Broker is required.",
                            validate: {
                              unique: (value, { brokers }) => {
                                const count = brokers.filter(
                                  ({ hostPort }) => hostPort === value
                                ).length;

                                return count <= 1 || "Brokers must be unique";
                              },
                            },
                          })}
                          aria-label={`Broker host ${index + 1}`}
                          placeholder="broker1:9092"
                          autoCorrect="off"
                          spellCheck="false"
                          size="sm"
                          variant={
                            formState.errors.brokers?.[index]?.hostPort
                              ? "error"
                              : "default"
                          }
                        />
                        <FormErrorMessage>
                          {formState.errors.brokers?.[index]?.hostPort?.message}
                        </FormErrorMessage>
                      </FormControl>
                    </HStack>
                    {index > 0 && (
                      <GutterContainer>
                        <Button
                          variant="borderless"
                          height="8"
                          minWidth="8"
                          width="8"
                          onClick={() => remove(index)}
                        >
                          <CloseIcon height="8px" width="8px" />
                        </Button>
                      </GutterContainer>
                    )}
                  </InlineLabeledInput>
                ))}
              </VStack>
              <Button
                p="0"
                leftIcon={<PlusCircleIcon />}
                height={8}
                background="none"
                sx={{
                  _hover: {
                    background: "none",
                  },
                }}
                variant="borderless"
                width="auto"
                onClick={() =>
                  append({
                    hostPort: "",
                    availabilityZone: "",
                    port: "",
                  })
                }
                mt="2"
              >
                Add Broker
              </Button>
            </FormSection>
            <FormSection title="Authentication">
              <Tabs
                variant="soft-rounded"
                isLazy
                index={authMode}
                onChange={(newTab) => setAuthMode(newTab)}
                size="sm"
              >
                <TabList>
                  <Tab>SASL</Tab>
                  <Tab>SSL</Tab>
                  <Tab>None</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <VStack spacing="6" alignItems="start">
                      <FormControl>
                        <InlineLabeledInput label="Mechanism">
                          <SearchableSelect
                            ariaLabel="Select SASL mechanism"
                            options={saslMechanismOptions}
                            isSearchable={false}
                            {...saslMechanismField}
                          />
                        </InlineLabeledInput>
                      </FormControl>

                      <SecretsFormControl
                        control={control}
                        register={register}
                        fieldKey="saslUsername"
                        fieldLabel="Username"
                        selectOptions={secrets ?? []}
                        selectProps={{
                          menuPlacement: "top",
                        }}
                        textInputProps={{
                          placeholder: "user",
                        }}
                        textInputRules={{
                          required: "Username is required.",
                        }}
                        selectRules={{
                          required: "Username is required.",
                        }}
                        canFieldBeText
                      />
                      <SecretsFormControl
                        control={control}
                        register={register}
                        fieldKey="saslPassword"
                        fieldLabel="Password"
                        selectOptions={secrets ?? []}
                        selectProps={{
                          menuPlacement: "top",
                          isClearable: true,
                        }}
                        selectRules={{
                          required: "Password is required.",
                        }}
                      />
                      <SecretsFormControl
                        control={control}
                        register={register}
                        fieldKey="sslCertificateAuthority"
                        fieldLabel="SSL Certificate Authority"
                        selectOptions={secrets ?? []}
                        selectProps={{
                          menuPlacement: "top",
                          isClearable: true,
                        }}
                        textInputProps={{
                          placeholder: "-----BEGIN CERTIFICATE...",
                        }}
                        canFieldBeText
                      />
                    </VStack>
                  </TabPanel>
                  <TabPanel>
                    <VStack spacing="6" alignItems="start">
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
                          required: "Key is required.",
                        }}
                      />
                      <SecretsFormControl
                        control={control}
                        register={register}
                        fieldKey="sslCertificate"
                        fieldLabel="SSL Certificate"
                        selectOptions={secrets ?? []}
                        selectProps={{
                          menuPlacement: "top",
                        }}
                        textInputProps={{
                          placeholder: "-----BEGIN CERTIFICATE...",
                        }}
                        textInputRules={{
                          required: "Certificate is required.",
                        }}
                        selectRules={{
                          required: "Certificate is required.",
                        }}
                        canFieldBeText
                      />
                      <SecretsFormControl
                        control={control}
                        register={register}
                        fieldKey="sslCertificateAuthority"
                        fieldLabel="SSL Certificate Authority"
                        selectOptions={secrets ?? []}
                        selectProps={{
                          menuPlacement: "top",
                          isClearable: true,
                        }}
                        textInputProps={{
                          placeholder: "-----BEGIN CERTIFICATE...",
                        }}
                        canFieldBeText
                      />
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </FormSection>
          </FormContainer>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default NewKafkaConnection;
