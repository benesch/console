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
  Grid,
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

import createSourceStatement from "~/api/materialize/createSourceStatement";
import { alreadyExistsError } from "~/api/materialize/parseErrors";
import useAvailableClusterSizes from "~/api/materialize/useAvailableClusterSizes";
import { Cluster, useClustersFetch } from "~/api/materialize/useClusters";
import {
  Connection,
  useConnectionsFiltered,
} from "~/api/materialize/useConnections";
import useDatabases, {
  Database,
  isDefaultDatabase,
} from "~/api/materialize/useDatabases";
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

export const NEW_CLUSTER_ID = "0";

const NewPostgresSource = () => {
  const [generalFormError, setGeneralFormError] = React.useState<
    string | undefined
  >(undefined);
  const navigate = useNavigate();
  const toast = useSuccessToast();
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  const [queryParams] = useSearchParams();
  const { data: databases, error: databasesError } = useDatabases();
  const { data: schemas, error: schemasError } = useSchemas();
  const { data: clusterSizes, error: clusterSizesError } =
    useAvailableClusterSizes();
  const { data: clusters, error: clustersError } = useClustersFetch();
  const { data: connections, error: connectionsError } = useConnectionsFiltered(
    {
      type: "postgres" as const,
    }
  );

  const clusterOptions = React.useMemo(() => {
    return [
      ...(clusters ?? []),
      {
        id: NEW_CLUSTER_ID,
        name: "Create new cluster",
        display: "addItem" as const,
      },
    ];
  }, [clusters]);

  const clusterSizeOptions = React.useMemo(() => {
    return (clusterSizes ?? []).map((s) => ({ id: s, name: s }));
  }, [clusterSizes]);

  const loadingError =
    databasesError ||
    schemasError ||
    clusterSizesError ||
    clustersError ||
    connectionsError;

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
  const { field: databaseField } = useController({
    control,
    name: "database",
    rules: {
      required: "Database is required.",
    },
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
          if (!value && selectedCluster?.id === "0") {
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
    queryBuilder: (values: FormState) => {
      assert(values.connection?.name);
      assert(values.cluster?.name);
      return {
        queries: [
          {
            query: createSourceStatement(values),
            params: [],
          },
          {
            query: `SELECT s.id, d.name as database_name, sc.name as schema_name
FROM mz_sources s
INNER JOIN mz_schemas sc ON sc.id = s.schema_id
INNER JOIN mz_databases d ON d.id = sc.database_id
WHERE s.name = $1;`,
            params: [values.name],
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
    if (!databases) return;
    if (getValues("database")) return;

    const selected = databases.find(isDefaultDatabase);
    if (selected) {
      setValue("database", selected);
    }
  }, [databases, getValues, setValue]);

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

  const additonalOptionsError =
    formState.errors.database || formState.errors.schema;

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
            title="Create a Postgres source"
            backButtonHref="../connection"
          >
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isDisabled={isCreating}
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
                    sectionLabel="Select connection"
                    placeholder="Select one"
                    {...connectionField}
                    options={connections ?? []}
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
                    placeholder="My postgres source"
                    autoCorrect="off"
                    size="sm"
                    variant={formState.errors.name ? "error" : "default"}
                  />
                </InlineLabeledInput>
              </FormControl>
              <Accordion
                allowToggle
                index={additonalOptionsError ? 0 : undefined}
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
                    <FormControl isInvalid={!!formState.errors.database} mb="4">
                      <InlineLabeledInput
                        label="Database"
                        error={formState.errors.database?.message}
                      >
                        <SearchableSelect
                          ariaLabel="Select database"
                          sectionLabel="Select database"
                          placeholder="Select one"
                          {...databaseField}
                          options={databases ?? []}
                        />
                      </InlineLabeledInput>
                    </FormControl>
                    <FormControl isInvalid={!!formState.errors.schema}>
                      <InlineLabeledInput
                        label="Schema"
                        error={formState.errors.schema?.message}
                      >
                        <SearchableSelect
                          ariaLabel="Select schema"
                          sectionLabel="Select schema"
                          placeholder="Select one"
                          {...schemaField}
                          options={schemas ?? []}
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
                      sectionLabel="Select cluster"
                      placeholder="Select one"
                      {...clusterField}
                      options={clusterOptions}
                    />
                    {selectedCluster?.id === "0" && (
                      <Text
                        color={semanticColors.foreground.secondary}
                        mt="2"
                        maxWidth="260px"
                        textStyle="text-small"
                      >
                        Cluster name: {sourceName}_linked_cluster. You can edit
                        this after creation.
                      </Text>
                    )}
                  </Box>
                </InlineLabeledInput>
              </FormControl>
              {selectedCluster?.id === "0" && (
                <FormControl isInvalid={!!formState.errors.clusterSize} mt="4">
                  <InlineLabeledInput
                    label="Cluster size"
                    error={formState.errors.clusterSize?.message}
                  >
                    <SearchableSelect
                      ariaLabel="Select cluster size"
                      sectionLabel="Select cluster size"
                      placeholder="Select one"
                      {...clusterSizeField}
                      options={clusterSizeOptions}
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
                      variant={
                        formState.errors.publication ? "error" : "default"
                      }
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
                    <VStack spacing="4">
                      {fields.map((field, index) => (
                        <Grid
                          key={field.id}
                          templateColumns="min-content minmax(auto, 156px) minmax(auto, 156px)"
                          columnGap="6"
                          justifyContent="space-between"
                          alignItems="start"
                          position="relative"
                          width="100%"
                        >
                          <FormLabel variant="inline">
                            Table {index + 1}
                          </FormLabel>
                          <FormControl
                            isInvalid={!!formState.errors.tables?.[index]}
                          >
                            <Input
                              {...register(`tables.${index}.name` as const, {
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
                            isInvalid={
                              !!formState.errors.tables?.[index]?.alias
                            }
                          >
                            <Input
                              {...register(`tables.${index}.alias` as const, {
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
                              {tableNameErrorMessage(
                                formState.errors.tables?.[index]?.alias
                              )}
                            </FormErrorMessage>
                          </FormControl>
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
                        </Grid>
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
      </ModalContent>
    </Modal>
  );
};

export default NewPostgresSource;
