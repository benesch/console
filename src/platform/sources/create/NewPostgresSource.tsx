import { CloseIcon } from "@chakra-ui/icons";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  FormControl,
  FormErrorMessage,
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
import React from "react";
import {
  FieldError,
  useController,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";

import segment from "~/analytics/segment";
import {
  Connection,
  useConnectionsFiltered,
} from "~/api/materialize/connection/useConnections";
import { alreadyExistsError } from "~/api/materialize/parseErrors";
import createPostgresSourceStatement from "~/api/materialize/source/createPostgresSourceStatement";
import getSourceByNameStatement from "~/api/materialize/source/getSourceByNameStatement";
import useAvailableClusterSizes from "~/api/materialize/useAvailableClusterSizes";
import { Cluster, useClustersFetch } from "~/api/materialize/useClusters";
import { Database } from "~/api/materialize/useDatabases";
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
  GutterContainer,
  InlineLabeledInput,
} from "~/components/formComponents";
import InlayBanner from "~/components/InlayBanner";
import ObjectNameInput from "~/components/ObjectNameInput";
import SchemaSelect from "~/components/SchemaSelect";
import SearchableSelect, { SelectOption } from "~/components/SearchableSelect";
import useSuccessToast from "~/components/SuccessToast";
import PlusCircleIcon from "~/svg/PlusCircleIcon";
import { MaterializeTheme } from "~/theme";
import { assert } from "~/util";

import { relativeSourceErrorsPath } from "../SourceRoutes";

type FormState = {
  name: string;
  connection: Connection | null;
  database: Database | null;
  schema: Schema | null;
  cluster: Cluster | null;
  clusterSize: SelectOption | null;
  publication: string;
  allTables: boolean;
  tables: {
    name: string;
    alias: string;
  }[];
};

function sourceNameErrorMessage(error: FieldError | undefined) {
  if (!error?.type) return error?.message;
  if (error.type === "pattern")
    return "Source name must not include special characters";
  if (error.type === "required") return "Source name is required.";
  if (error.type === "unique") return "Source names must be unique.";
}

function tableNameErrorMessage(error: FieldError | undefined): React.ReactNode {
  if (!error?.type) return error?.message;
  if (error.type === "pattern")
    return "Table name must not include special characters";
  if (error.type === "required") return "Table name is required.";
  if (error.type === "unique") return "Table names must be unique.";
}

function tableAliasErrorMessage(
  error: FieldError | undefined
): React.ReactNode {
  if (!error?.type) return error?.message;
  if (error.type === "pattern")
    return "Alias must not include special characters";
  if (error.type === "unique") return "Alias must be unique.";
}

export const NEW_CLUSTER_ID = "0";

export const NewPostgresSourceForm = () => {
  const [generalFormError, setGeneralFormError] = React.useState<
    string | undefined
  >(undefined);
  const navigate = useNavigate();
  const toast = useSuccessToast();
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  const [queryParams] = useSearchParams();
  const { data: schemas, error: schemasError } = useSchemas();
  const { data: clusterSizes, error: clusterSizesError } =
    useAvailableClusterSizes();
  const { data: clusters, error: clustersError } = useClustersFetch();
  const { data: connections, error: connectionsError } = useConnectionsFiltered(
    {
      type: "postgres" as const,
    }
  );

  const NEW_CLUSTER_ID_OPTION = {
    id: NEW_CLUSTER_ID,
    name: "Create new cluster",
  };

  const clusterSizeOptions = React.useMemo(() => {
    return (clusterSizes ?? []).map((s) => ({ id: s, name: s }));
  }, [clusterSizes]);

  const loadingError =
    schemasError || clusterSizesError || clustersError || connectionsError;

  const {
    control,
    formState,
    getValues,
    setValue,
    handleSubmit,
    register,
    setError,
    setFocus,
    watch,
    trigger,
  } = useForm<FormState>({
    defaultValues: {
      name: "",
      connection: null,
      cluster: null,
      publication: "",
      allTables: false,
      tables: [{ name: "", alias: "" }],
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
        required: (value) => {
          const selectedCluster = getValues("cluster");
          if (!value && selectedCluster?.id === NEW_CLUSTER_ID) {
            return "Cluster size is required.";
          }
        },
      },
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "tables",
  });

  const { runSql: createSource, loading: isCreating } = useSqlLazy({
    // Materialize has a 30 second timeout for attempting to connect to postgres
    timeout: 35_000,
    queryBuilder: (values: FormState) => {
      assert(values.schema);
      assert(values.connection);
      assert(values.cluster);
      return {
        queries: [
          {
            // new object to narrow the type
            query: createPostgresSourceStatement({
              ...values,
              cluster: values.cluster,
              connection: values.connection,
              databaseName: values.schema.databaseName,
              schemaName: values.schema.name,
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
  });

  const handleValidSubmit = (values: FormState) => {
    setGeneralFormError(undefined);
    createSource(values, {
      onSuccess: async (response) => {
        assert(response);
        const id = response[1].rows[0][0] as string;
        const databaseName = response[1].rows[0][1] as string;
        const schemaName = response[1].rows[0][2] as string;
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
        const objectName = alreadyExistsError(errorMessage);
        if (objectName === values.name) {
          setError("name", {
            message: "A source with that name already exists.",
          });
          setFocus("name");
          return;
        }
        const aliasIndex = values.tables.findIndex(
          (t) => t.alias === objectName
        );
        if (aliasIndex > -1) {
          const name = `tables.${aliasIndex}.alias` as const;
          setError(name, {
            message: "A object with that name already exists.",
          });
          setFocus(name);
          return;
        }
        const tableIndex = values.tables.findIndex(
          (t) => t.name === objectName
        );
        if (tableIndex > -1) {
          const name = `tables.${tableIndex}.name` as const;
          setError(name, {
            message: "A object with that name already exists.",
          });
          setFocus(name);
          return;
        }
        setGeneralFormError(errorMessage);
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

  const sourceName = watch("name");
  const allTables = watch("allTables");
  const selectedCluster = watch("cluster");

  if (loadingError) {
    return <ErrorBox />;
  }
  return (
    <form onSubmit={handleSubmit(handleValidSubmit)}>
      <FormTopBar
        title="Create a Postgres source"
        backButtonHref="../connection"
      >
        <Button
          variant="primary"
          size="sm"
          type="submit"
          isDisabled={isCreating}
          onClick={() =>
            segment.track("Create Source Clicked", { type: "postgres" })
          }
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
                variant={formState.errors.connection ? "error" : "default"}
              />
            </InlineLabeledInput>
          </FormControl>
        </FormSection>
        <FormSection title="General">
          <FormControl isInvalid={!!formState.errors.name} mb="4">
            <InlineLabeledInput
              label="Name"
              error={sourceNameErrorMessage(formState.errors.name)}
              message="Alphanumeric characters and underscores only."
            >
              <ObjectNameInput
                {...register("name", {
                  required: true,
                  pattern: MATERIALIZE_DATABASE_IDENTIFIER_REGEX,
                })}
                autoFocus
                placeholder="My_postgres_source"
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
                  options={[
                    {
                      label: "Select cluster",
                      options: clusters ?? [],
                    },
                  ]}
                  displayAddNewItem
                  addNewItemLabel="Create new cluster"
                  onAddNewItem={() => {
                    clusterField.onChange(NEW_CLUSTER_ID_OPTION);
                  }}
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
                      options: clusterSizeOptions,
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
            <FormControl isInvalid={!!formState.errors.publication}>
              <InlineLabeledInput
                label="Publication"
                error={formState.errors.publication?.message}
              >
                <ObjectNameInput
                  {...register("publication", {
                    required: "Publication is required.",
                  })}
                  placeholder="postgres"
                  autoCorrect="off"
                  size="sm"
                  variant={formState.errors.publication ? "error" : "default"}
                />
              </InlineLabeledInput>
            </FormControl>
            <FormControl flexDir="row" display="flex">
              <Switch {...register("allTables" as const)} />
              <FormLabel m="0" ml="2" lineHeight="16px">
                For all tables
              </FormLabel>
            </FormControl>
            {!allTables && (
              <>
                <VStack spacing="4" width="100%">
                  {fields.map((field, index) => (
                    <InlineLabeledInput
                      key={field.id}
                      label={`Table ${index + 1}`}
                    >
                      <HStack alignItems="start">
                        <FormControl
                          isInvalid={!!formState.errors.tables?.[index]}
                        >
                          <Input
                            {...register(`tables.${index}.name` as const, {
                              onChange: () => {
                                for (let i = 0; i < fields.length; i++) {
                                  trigger(`tables.${i}.name`);
                                }
                              },
                              required: true,
                              pattern: MATERIALIZE_DATABASE_IDENTIFIER_REGEX,
                              validate: {
                                unique: (value) => {
                                  const count = getValues()
                                    .tables.map((r) => r.name)
                                    .filter((name) => name === value).length;
                                  return count <= 1;
                                },
                              },
                            })}
                            placeholder="table name"
                            autoCorrect="off"
                            spellCheck="false"
                            size="sm"
                            variant={
                              formState.errors.tables?.[index]?.name
                                ? "error"
                                : "default"
                            }
                          />
                          <FormErrorMessage>
                            {tableNameErrorMessage(
                              formState.errors.tables?.[index]?.name
                            )}
                          </FormErrorMessage>
                        </FormControl>
                        <FormControl
                          isInvalid={!!formState.errors.tables?.[index]?.alias}
                        >
                          <Input
                            {...register(`tables.${index}.alias` as const, {
                              onChange: () => {
                                for (let i = 0; i < fields.length; i++) {
                                  trigger(`tables.${i}.alias`);
                                }
                              },
                              pattern: MATERIALIZE_DATABASE_IDENTIFIER_REGEX,
                              validate: {
                                unique: (value) => {
                                  // alias is not required
                                  if (!value) return true;
                                  const count = getValues()
                                    .tables.map((r) => r.alias)
                                    .filter((name) => name === value).length;
                                  return count <= 1;
                                },
                              },
                            })}
                            placeholder="alias"
                            autoCorrect="off"
                            spellCheck="false"
                            size="sm"
                            variant={
                              formState.errors.tables?.[index]?.alias
                                ? "error"
                                : "default"
                            }
                          />
                          <FormErrorMessage>
                            {tableAliasErrorMessage(
                              formState.errors.tables?.[index]?.alias
                            )}
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
                      name: "",
                      alias: "",
                    })
                  }
                >
                  <Box mr="2">
                    <PlusCircleIcon />
                  </Box>
                  Add table
                </Button>
              </>
            )}
          </VStack>
        </FormSection>
      </FormContainer>
    </form>
  );
};

const NewPostgresSource = () => {
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
        <NewPostgresSourceForm />
      </ModalContent>
    </Modal>
  );
};

export default NewPostgresSource;
