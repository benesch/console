import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Modal,
  ModalContent,
  Text,
  useDisclosure,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { useController, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useSegment } from "~/analytics/segment";
import useConnectorClusters, {
  Cluster,
} from "~/api/materialize/cluster/useConnectorClusters";
import {
  Connection,
  normalizeConnectionRow,
  useConnectionsFiltered,
} from "~/api/materialize/connection/useConnections";
import { alreadyExistsError } from "~/api/materialize/parseErrors";
import createKafkaSourceStatement from "~/api/materialize/source/createKafkaSourceStatement";
import getSourceByNameStatement from "~/api/materialize/source/getSourceByNameStatement";
import useAvailableClusterSizes from "~/api/materialize/useAvailableClusterSizes";
import useSchemas, {
  isDefaultSchema,
  Schema,
} from "~/api/materialize/useSchemas";
import { MATERIALIZE_DATABASE_IDENTIFIER_REGEX } from "~/api/materialize/validation";
import { useSqlLazy } from "~/api/materialized";
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
import useSuccessToast from "~/components/SuccessToast";
import { MaterializeTheme } from "~/theme";
import { assert } from "~/util";

import { relativeSourceErrorsPath } from "../SourceRoutes";
import NewConfluentSchemaRegistryConnection from "./NewConfluentSchemaRegistryConnection";
import ProlongedKafkaSourceCreationModal from "./ProlongedKafkaSourceCreationModal";

const PROLONGED_MODAL_DELAY = 1_500;

const formatOptions = [
  { id: "avro" as const, name: "Avro" },
  { id: "protobuf" as const, name: "Protobuf" },
  { id: "text" as const, name: "Text" },
  { id: "bytes" as const, name: "Bytes" },
];

export type KafkaFormat = (typeof formatOptions)[number]["id"];

const envelopeOptions = [
  { id: "none" as const, name: "None" },
  { id: "upsert" as const, name: "Upsert" },
  { id: "debezium" as const, name: "Debezium" },
];

// Envelope options given by https://materialize.com/docs/sql/create-source/kafka/#supported-formats
const envelopeOptionsByFormat = {
  avro: envelopeOptions,
  protobuf: [envelopeOptions[0], envelopeOptions[1]],
  text: [envelopeOptions[0], envelopeOptions[1]],
  bytes: [envelopeOptions[0], envelopeOptions[1]],
};

export type KafkaEnvelope = (typeof envelopeOptions)[number]["id"];

type FormState = {
  name: string;
  connection: Connection | null;
  schema: Schema | null;
  cluster: Cluster | null;
  clusterSize: SelectOption | null;
  topic: string;
  format: (typeof formatOptions)[number];
  csrConnection: Connection | null;
  envelope: (typeof envelopeOptions)[number];
  useSchemaRegistry: boolean;
};

export const NEW_CLUSTER_ID = "0";

const NEW_CLUSTER_ID_OPTION = {
  id: NEW_CLUSTER_ID,
  name: "Create new cluster",
};

const requiresSchemaRegistry = (format?: KafkaFormat) =>
  format === "avro" || format === "protobuf";

export const NewKafkaSourceForm = () => {
  const [generalFormError, setGeneralFormError] = React.useState<
    string | undefined
  >(undefined);
  const navigate = useNavigate();
  const toast = useSuccessToast();
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  const { track } = useSegment();
  const [queryParams] = useSearchParams();
  const { data: schemas, error: schemasError } = useSchemas();
  const { data: clusterSizes, error: clusterSizesError } =
    useAvailableClusterSizes();
  const { data: clusters, error: clustersError } = useConnectorClusters();
  const { data: connections, error: connectionsError } = useConnectionsFiltered(
    {
      type: "kafka" as const,
    }
  );
  const {
    data: csrConnections,
    refetch: refetchCsrConnections,
    error: csrConnectionsError,
  } = useConnectionsFiltered({
    type: "confluent-schema-registry" as const,
  });

  const clusterSizeOptions = React.useMemo(() => {
    return (clusterSizes ?? []).map((s) => ({ id: s, name: s }));
  }, [clusterSizes]);

  const loadingError =
    schemasError ||
    clusterSizesError ||
    clustersError ||
    csrConnectionsError ||
    connectionsError;
  const {
    isOpen: isCsrConnectionModalOpen,
    onOpen: openCsrConnectionModal,
    onClose: closeCsrConnectionModal,
  } = useDisclosure();

  const {
    isOpen: isCreationProlonged,
    onClose: onProlongedCreationModalClose,
    onOpen: onProlongedCreationModalOpen,
  } = useDisclosure();
  const {
    control,
    formState,
    getValues,
    setValue,
    handleSubmit,
    register,
    setError,
    watch,
  } = useForm<FormState>({
    defaultValues: {
      name: "",
      connection: null,
      schema: null,
      cluster: null,
      clusterSize: null,
      topic: "",
      format: formatOptions[0],
      csrConnection: null,
      envelope: envelopeOptions[0],
      useSchemaRegistry: false,
    },
    mode: "onTouched",
  });
  const { field: connectionField } = useController({
    control,
    name: "connection",
  });
  const { field: schemaField } = useController({
    control,
    name: "schema",
    rules: {
      required: "Schema is required.",
    },
  });
  const { field: clusterField } = useController({
    control,
    name: "cluster",
    rules: {
      required: "Cluster is required.",
    },
  });
  const { field: clusterSizeField } = useController({
    control,
    name: "clusterSize",
    rules: {
      validate: {
        required: (value, { cluster }) => {
          if (!value && cluster?.id === NEW_CLUSTER_ID) {
            return "Cluster size is required.";
          }
        },
      },
    },
  });
  const { field: formatField } = useController({
    control,
    name: "format",
    rules: {
      required: "Format is required.",
    },
  });
  const { field: csrConnectionField } = useController({
    control,
    name: "csrConnection",
    rules: {
      validate: {
        required: (value, { format }) => {
          if (!value && requiresSchemaRegistry(format?.id)) {
            return "Schema registry connection is required.";
          }
        },
      },
    },
  });
  const { field: envelopeField } = useController({
    control,
    name: "envelope",
    rules: {
      required: "Envelope is required.",
    },
  });

  const { runSql: createSource, loading: isCreating } = useSqlLazy({
    queryBuilder: (values: FormState) => {
      assert(values.schema);
      assert(values.connection);
      assert(values.cluster);

      return {
        queries: [
          {
            // new object to narrow the type
            query: createKafkaSourceStatement({
              ...values,
              cluster: values.cluster,
              databaseName: values.schema.databaseName,
              schemaName: values.schema.name,
              connection: values.connection,
              format: values.format.id,
              formatConnection: values.csrConnection,
              envelope: values.envelope.id,
            }),
            params: [],
          },
          {
            query: getSourceByNameStatement(
              values.name,
              values.schema.databaseName,
              values.schema.name
            ),
            params: [],
          },
        ],
        cluster: "mz_introspection",
      };
    },
    // Takes mz approximately 30 seconds to decide if it can connect to a Kafka consumer
    timeout: 35_000,
  });

  const handleCsrConnectionCreated = React.useCallback(
    async (newConnectionId: string) => {
      const [results] = (await refetchCsrConnections()) ?? [];

      if (results) {
        for (const row of results.rows) {
          const conn = normalizeConnectionRow(row, results.getColumnByName);
          if (conn.id === newConnectionId) {
            setValue("csrConnection", conn, { shouldValidate: true });
            break;
          }
        }
      }

      closeCsrConnectionModal();
    },
    [closeCsrConnectionModal, refetchCsrConnections, setValue]
  );

  const handleValidSubmit = (values: FormState) => {
    setGeneralFormError(undefined);
    const timeoutId = setTimeout(() => {
      onProlongedCreationModalOpen();
    }, PROLONGED_MODAL_DELAY);

    createSource(values, {
      onSuccess: async (response) => {
        assert(response);
        assert(response.length >= 2);
        const [_, getSourceResults] = response;

        const { getColumnByName, rows } = getSourceResults;
        const id = getColumnByName?.(rows[0], "id") as string;
        const databaseName = getColumnByName?.(
          rows[0],
          "database_name"
        ) as string;
        const schemaName = getColumnByName?.(rows[0], "schema_name") as string;

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
          `../../${relativeSourceErrorsPath({
            id,
            name: values.name,
            schemaName,
            databaseName,
          })}`
        );
      },
      onError: (errorMessage) => {
        if (alreadyExistsError(errorMessage)) {
          setError("name", {
            message: "A source with that name already exists.",
          });
          return;
        }
        setGeneralFormError(errorMessage);
      },
      onSettled: () => {
        onProlongedCreationModalClose();
        clearTimeout(timeoutId);
      },
    });
  };

  React.useEffect(() => {
    if (!connections) return;
    if (getValues("connection")) return;

    const selected = connections.find(
      (c) => c.id === queryParams.get("connectionId")
    );
    if (selected) {
      setValue("connection", selected);
    }
  }, [connections, getValues, queryParams, setValue]);

  React.useEffect(() => {
    if (!schemas) return;
    if (getValues("schema")) return;

    const selected = schemas.find(isDefaultSchema);
    if (selected) {
      setValue("schema", selected);
    }
  }, [schemas, getValues, setValue]);

  const format = watch("format");
  const selectedCluster = watch("cluster");
  const sourceName = watch("name");
  const envelope = watch("envelope");

  const curEnvelopeInOptions = envelopeOptionsByFormat[format.id].some(
    ({ id }) => id === envelope.id
  );

  if (!curEnvelopeInOptions) {
    setValue("envelope", envelopeOptionsByFormat[format.id][0]);
  }

  if (loadingError) {
    return <ErrorBox />;
  }
  return (
    <>
      <form onSubmit={handleSubmit(handleValidSubmit)}>
        <FormTopBar
          title="Create a Kafka source"
          backButtonHref="../connection"
        >
          <Button
            variant="primary"
            size="sm"
            type="submit"
            isDisabled={isCreating}
            onClick={() => track("Create Source Clicked", { type: "kafka" })}
          >
            Create source
          </Button>
        </FormTopBar>
        <FormContainer title="Source information">
          {generalFormError && (
            <InlayBanner
              variant="error"
              label="Error"
              message={generalFormError}
              mb="10"
            />
          )}
          <FormSection title="Data connection">
            <FormControl>
              <InlineLabeledInput label="Connection">
                <SearchableSelect
                  ariaLabel="Select connection"
                  placeholder="Select one"
                  {...connectionField}
                  options={[
                    {
                      label: "Select connection",
                      options: connections ?? [],
                    },
                  ]}
                />
              </InlineLabeledInput>
            </FormControl>
          </FormSection>
          <FormSection title="General">
            <FormControl isInvalid={!!formState.errors.name} mb="4">
              <InlineLabeledInput
                label="Name"
                error={formState.errors.name?.message}
                message="Alphanumeric characters and underscores only."
              >
                <ObjectNameInput
                  {...register("name", {
                    required: "Source name is required.",
                    pattern: {
                      message:
                        "Source name must not include special characters.",
                      value: MATERIALIZE_DATABASE_IDENTIFIER_REGEX,
                    },
                  })}
                  autoFocus
                  placeholder="my_kafka_source"
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
                        variant={formState.errors.schema ? "error" : "default"}
                      />
                    </InlineLabeledInput>
                  </FormControl>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </FormSection>
          <FormSection title="Compute cluster">
            <FormControl isInvalid={!!formState.errors.cluster}>
              <InlineLabeledInput
                label="Cluster"
                error={formState.errors.cluster?.message}
              >
                <Box>
                  <SearchableSelect
                    ariaLabel="Select cluster"
                    placeholder="Select one"
                    {...clusterField}
                    displayAddNewItem
                    addNewItemLabel="Create new cluster"
                    onAddNewItem={() => {
                      clusterField.onChange(NEW_CLUSTER_ID_OPTION);
                    }}
                    options={[
                      {
                        label: "Select cluster",
                        options: clusters,
                      },
                    ]}
                    variant={formState.errors.cluster ? "error" : "default"}
                  />
                  {selectedCluster?.id === NEW_CLUSTER_ID && sourceName && (
                    <Text
                      color={semanticColors.foreground.secondary}
                      mt="2"
                      maxWidth="260px"
                      textStyle="text-ui-reg"
                    >
                      Cluster name: {sourceName}_linked_cluster.
                    </Text>
                  )}
                </Box>
              </InlineLabeledInput>
            </FormControl>
            {selectedCluster?.id === NEW_CLUSTER_ID && (
              <FormControl isInvalid={!!formState.errors.clusterSize} mt="4">
                <InlineLabeledInput
                  label="Cluster size"
                  error={formState.errors.clusterSize?.message}
                >
                  <SearchableSelect
                    ariaLabel="Select cluster size"
                    placeholder="Select one"
                    {...clusterSizeField}
                    options={[
                      {
                        label: "Select cluster size",
                        options: clusterSizeOptions ?? [],
                      },
                    ]}
                    variant={formState.errors.clusterSize ? "error" : "default"}
                  />
                </InlineLabeledInput>
              </FormControl>
            )}
          </FormSection>
          <FormSection title="Configuration">
            <VStack spacing="6" alignItems="start">
              <FormControl isInvalid={!!formState.errors.topic}>
                <InlineLabeledInput
                  label="Topic"
                  error={formState.errors.topic?.message}
                >
                  <ObjectNameInput
                    {...register("topic", {
                      required: "Topic is required.",
                    })}
                    placeholder="topic_1"
                    autoCorrect="off"
                    size="sm"
                    variant={formState.errors.topic ? "error" : "default"}
                  />
                </InlineLabeledInput>
              </FormControl>
              <FormControl isInvalid={!!formState.errors.format}>
                <InlineLabeledInput
                  label="Format"
                  error={formState.errors.format?.message}
                >
                  <SearchableSelect
                    ariaLabel="Select format"
                    placeholder="Select one"
                    {...formatField}
                    options={[
                      {
                        label: "Select format",
                        options: formatOptions ?? [],
                      },
                    ]}
                    menuPlacement="top"
                    variant={formState.errors.format ? "error" : "default"}
                  />
                </InlineLabeledInput>
              </FormControl>
              {requiresSchemaRegistry(format?.id) && (
                <FormControl isInvalid={!!formState.errors.csrConnection}>
                  <Flex ml="100px">
                    <Box
                      backgroundColor={semanticColors.border.primary}
                      width="4px"
                      borderRadius="16px"
                      mr="4"
                    />
                    <Box width="100%">
                      <FormLabel>Confluent Schema Registry</FormLabel>
                      <SearchableSelect
                        ariaLabel="Choose connection"
                        placeholder="Choose connection"
                        {...csrConnectionField}
                        options={csrConnections ?? []}
                        displayAddNewItem
                        onAddNewItem={() => {
                          track("New Schema Registry Connection Clicked");
                          openCsrConnectionModal();
                        }}
                        addNewItemLabel="New schema registry connection"
                        menuPlacement="top"
                        variant={
                          formState.errors.csrConnection ? "error" : "default"
                        }
                      />
                      <FormErrorMessage>
                        {formState.errors.csrConnection?.message}
                      </FormErrorMessage>
                    </Box>
                  </Flex>
                </FormControl>
              )}
              <FormControl isInvalid={!!formState.errors.envelope}>
                <InlineLabeledInput
                  label="Envelope"
                  error={formState.errors.envelope?.message}
                >
                  <SearchableSelect
                    ariaLabel="Select envelope"
                    placeholder="Select one"
                    {...envelopeField}
                    options={[
                      {
                        label: "Select envelope",
                        options: envelopeOptionsByFormat[format?.id],
                      },
                    ]}
                    menuPlacement="top"
                    variant={formState.errors.envelope ? "error" : "default"}
                  />
                </InlineLabeledInput>
              </FormControl>
            </VStack>
          </FormSection>
        </FormContainer>
      </form>
      <NewConfluentSchemaRegistryConnection
        isOpen={isCsrConnectionModalOpen}
        onClose={closeCsrConnectionModal}
        onSuccess={handleCsrConnectionCreated}
      />
      <ProlongedKafkaSourceCreationModal isOpen={isCreationProlonged} />
    </>
  );
};

const NewKafkaSource = () => {
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
        <NewKafkaSourceForm />
      </ModalContent>
    </Modal>
  );
};

export default NewKafkaSource;
