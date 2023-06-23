import { CloseIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  Grid,
  Modal,
  ModalContent,
  Text,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { FieldError, useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { useSegment } from "~/analytics/segment";
import { alreadyExistsError } from "~/api/materialize/parseErrors";
import useAvailableClusterSizes from "~/api/materialize/useAvailableClusterSizes";
import useMaxReplicasPerCluster from "~/api/materialize/useMaxReplicasPerCluster";
import { MATERIALIZE_DATABASE_IDENTIFIER_REGEX } from "~/api/materialize/validation";
import { Results, useSqlLazy } from "~/api/materialized";
import {
  FormContainer,
  FormInfoBox,
  FormSection,
  FormTopBar,
  GutterContainer,
  InlineLabeledInput,
} from "~/components/formComponents";
import InlayBanner from "~/components/InlayBanner";
import ObjectNameInput from "~/components/ObjectNameInput";
import SimpleSelect from "~/components/SimpleSelect";
import useSuccessToast from "~/components/SuccessToast";
import TextLink from "~/components/TextLink";
import PlusCircleIcon from "~/svg/PlusCircleIcon";
import { MaterializeTheme } from "~/theme";
import { assert } from "~/util";

import { relativeClusterPath } from "./ClusterRoutes";

type FormState = {
  name: string;
  replicas: {
    replicaName: string;
    replicaSize: string;
  }[];
};

const DEFAULT_SIZE_OPTION = "3xsmall";

const clusterNameErrorMessage = (error: FieldError | undefined) => {
  if (!error?.type) return error?.message;
  if (error.type === "pattern")
    return "Cluster name must not include special characters";
  if (error.type === "required") return "Cluster name is required.";
};

const replicaErrorMessage = (error: FieldError | undefined) => {
  if (!error?.type) return error?.message;
  if (error.type === "pattern")
    return "Replica name must not include special characters";
  if (error.type === "required") return "Replica name is required.";
  if (error.type === "unique") return "Replica names must be unique.";
};

export interface NewClusterFormProps {
  refetchClusters: () => Promise<Results[] | null | undefined>;
}
const NewClusterForm = ({
  refetchClusters,
}: React.PropsWithChildren<NewClusterFormProps>) => {
  const [generalFormError, setGeneralFormError] = React.useState<
    string | undefined
  >(undefined);
  const navigate = useNavigate();
  const toast = useSuccessToast();

  const { colors } = useTheme<MaterializeTheme>();
  const { track } = useSegment();

  const { data: clusterSizes } = useAvailableClusterSizes();
  const { data: maxReplicas } = useMaxReplicasPerCluster();
  const {
    control,
    formState,
    getValues,
    handleSubmit,
    register,
    setError,
    setFocus,
  } = useForm<FormState>({
    defaultValues: {
      name: "",
      replicas: [{ replicaName: "", replicaSize: DEFAULT_SIZE_OPTION }],
    },
    mode: "onTouched",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "replicas",
  });

  const { runSql: createCluster, loading: isCreating } = useSqlLazy({
    queryBuilder: ({ name, replicas }: FormState) => {
      return {
        queries: [
          {
            query: `
CREATE CLUSTER ${name}
REPLICAS (
  ${replicas.map((r) => `${r.replicaName} (SIZE = '${r.replicaSize}')`)}
);
`,
            params: [],
          },
          {
            query: `SELECT id FROM mz_clusters WHERE name = $1;`,
            params: [name],
          },
        ],
        cluster: "mz_introspection",
      };
    },
  });

  const handleValidSubmit = (values: FormState) => {
    createCluster(values, {
      onSuccess: async (response) => {
        assert(response);
        const id = response[1].rows[0][0] as string;
        await refetchClusters();
        toast({
          description: (
            <>
              <Text color={colors.foreground.primary} as="span">
                {values.name}{" "}
              </Text>
              created successfully
            </>
          ),
        });
        navigate(`../${relativeClusterPath({ id, name: values.name })}`);
      },
      onError: (errorMessage) => {
        let userErrorMessage: string | undefined = undefined;
        const objectName = alreadyExistsError(errorMessage);
        if (objectName) {
          userErrorMessage = `A cluster with that name already exists.`;
        }
        if (userErrorMessage) {
          if (objectName === values.name) {
            setError("name", {
              message: userErrorMessage,
            });
            setFocus("name");
          }
        } else {
          setGeneralFormError(errorMessage);
        }
      },
    });
  };

  return (
    <Modal
      isOpen
      onClose={() => navigate("..")}
      variant="fullscreen"
      closeOnEsc={false}
    >
      <ModalContent>
        <form onSubmit={handleSubmit(handleValidSubmit)}>
          <FormTopBar title="New Cluster" backButtonHref="..">
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isDisabled={isCreating}
              onClick={() => track("Create Cluster Clicked")}
            >
              Create cluster
            </Button>
          </FormTopBar>
          <FormContainer
            title="Cluster information"
            aside={
              <FormInfoBox>
                <Text
                  fontSize="14px"
                  lineHeight="16px"
                  fontWeight={500}
                  color={colors.foreground.primary}
                  mb={2}
                >
                  Not sure how to set up your cluster?
                </Text>
                <Text
                  fontSize="14px"
                  lineHeight="20px"
                  color={colors.foreground.secondary}
                  maxW={{ md: "40ch" }}
                  mb={4}
                >
                  View the documentation to learn how clusters and cluster
                  replicas work in Materialize.
                </Text>
                <TextLink
                  fontSize="14px"
                  lineHeight="16px"
                  fontWeight={500}
                  color={colors.accent.brightPurple}
                  sx={{
                    fontFeatureSettings: '"calt"',
                    textDecoration: "none",
                  }}
                  href="https://materialize.com/docs/sql/create-cluster/"
                  target="_blank"
                  rel="noopener"
                >
                  View cluster documentation -&gt;
                </TextLink>
              </FormInfoBox>
            }
          >
            {generalFormError && (
              <InlayBanner
                variant="error"
                label="Error"
                message={generalFormError}
                mb="40px"
              />
            )}
            <FormSection title="General">
              <FormControl isInvalid={!!formState.errors.name}>
                <InlineLabeledInput
                  label="Name"
                  error={clusterNameErrorMessage(formState.errors.name)}
                  message="Alphanumeric characters and underscores only."
                >
                  <ObjectNameInput
                    {...register("name", {
                      required: "Cluster name is required.",
                      pattern: MATERIALIZE_DATABASE_IDENTIFIER_REGEX,
                      min: {
                        value: 5,
                        message: "wow",
                      },
                    })}
                    autoFocus
                    placeholder="my_production_cluster"
                    autoCorrect="off"
                    size="sm"
                    variant={formState.errors.name ? "error" : "default"}
                  />
                </InlineLabeledInput>
              </FormControl>
            </FormSection>
            <FormSection title="Cluster Replicas">
              <VStack spacing="4">
                {fields.map((field, index) => (
                  <Grid
                    key={field.id}
                    width="100%"
                    templateColumns="1fr 1fr"
                    alignItems="start"
                    gap="16px"
                    position="relative"
                  >
                    <FormControl
                      isInvalid={!!formState.errors.replicas?.[index]}
                    >
                      <ObjectNameInput
                        {...register(`replicas.${index}.replicaName` as const, {
                          required: true,
                          pattern: MATERIALIZE_DATABASE_IDENTIFIER_REGEX,
                          validate: {
                            unique: (value) => {
                              const count = getValues()
                                .replicas.map((r) => r.replicaName)
                                .filter((name) => name === value).length;
                              return count <= 1;
                            },
                          },
                        })}
                        placeholder={`r${index + 1}`}
                        autoCorrect="off"
                        spellCheck="false"
                        size="sm"
                        variant={
                          formState.errors.replicas?.[index]?.replicaName
                            ? "error"
                            : "default"
                        }
                      />
                      <FormErrorMessage>
                        {replicaErrorMessage(
                          formState.errors.replicas?.[index]?.replicaName
                        )}
                      </FormErrorMessage>
                    </FormControl>
                    <FormControl>
                      {clusterSizes && (
                        <SimpleSelect
                          {...register(
                            `replicas.${index}.replicaSize` as const
                          )}
                        >
                          {clusterSizes.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </SimpleSelect>
                      )}
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
              {maxReplicas && getValues().replicas.length < maxReplicas && (
                <Button
                  mt="4"
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
                      replicaName: "",
                      replicaSize: DEFAULT_SIZE_OPTION,
                    })
                  }
                >
                  <Box mr="2">
                    <PlusCircleIcon />
                  </Box>
                  Add cluster replica
                </Button>
              )}
            </FormSection>
          </FormContainer>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default NewClusterForm;
