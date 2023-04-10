import { CloseIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Input,
  Modal,
  ModalContent,
  Spinner,
  Text,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { alreadyExistsError } from "~/api/materialize/parseErrors";
import useAvailableClusterSizes from "~/api/materialize/useAvailableClusterSizes";
import useMaxReplicasPerCluster from "~/api/materialize/useMaxReplicasPerCluster";
import { useSqlLazy } from "~/api/materialized";
import FormContainer from "~/components/FormContainer";
import FormInfoBox from "~/components/FormInfoBox";
import FormSection from "~/components/FormSection";
import FormTopBar from "~/components/FormTopBar";
import FullScreen from "~/components/FullScreen";
import InlayBanner from "~/components/InlayBanner";
import SimpleSelect from "~/components/SimpleSelect";
import TextLink from "~/components/TextLink";
import PlusCircleIcon from "~/svg/PlusCircleIcon";
import { MaterializeTheme } from "~/theme";

type FormState = {
  name: string;
  replicas: {
    replicaName: string;
    replicaSize: string;
  }[];
};

const DEFAULT_SIZE_OPTION = "3xsmall";

const replicaErrorMessage = (type?: string) => {
  if (!type) return;
  if (type === "required") return "Replica name is required.";
  if (type === "unique") return "Replica names must be unique.";
};

export interface NewClusterFormProps {
  refetchClusters: () => Promise<void>;
}
const NewClusterForm = ({
  refetchClusters,
}: React.PropsWithChildren<NewClusterFormProps>) => {
  const [generalFormError, setGeneralFormError] = React.useState<
    string | undefined
  >(undefined);
  const navigate = useNavigate();

  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();

  const { data: clusterSizes } = useAvailableClusterSizes();
  const { data: maxReplicas } = useMaxReplicasPerCluster();
  const {
    control,
    formState,
    getValues,
    handleSubmit: handleSubmit,
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
      return `
CREATE CLUSTER ${name}
REPLICAS (
  ${replicas.map((r) => `${r.replicaName} (SIZE = '${r.replicaSize}')`)}
);
`;
    },
  });

  const handleValidSubmit = (values: FormState) => {
    createCluster(values, {
      onSuccess: async () => {
        await refetchClusters();
        navigate("..");
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
          <FullScreen>
            <FormTopBar title="New Cluster" backButtonHref="..">
              <Button variant="primary" size="sm" type="submit">
                {isCreating ? <Spinner /> : "Create cluster"}
              </Button>
            </FormTopBar>
            <FormContainer
              title="Cluster Information"
              aside={
                <FormInfoBox>
                  <Text
                    fontSize="14px"
                    lineHeight="16px"
                    fontWeight={500}
                    color={semanticColors.foreground.primary}
                    mb={2}
                  >
                    Not sure how to set up your cluster?
                  </Text>
                  <Text
                    fontSize="14px"
                    lineHeight="20px"
                    color={semanticColors.foreground.secondary}
                    maxW="40ch"
                    mb={4}
                  >
                    View the documentation to learn how clusters and cluster
                    replicas work in Materialize.
                  </Text>
                  <TextLink
                    fontSize="14px"
                    lineHeight="16px"
                    fontWeight={500}
                    color={semanticColors.accent.brightPurple}
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
                <FormControl
                  isInvalid={!!formState.errors.name}
                  variant="leftAlignedLabel"
                >
                  <FormLabel variant="inline">Name</FormLabel>
                  <Input
                    {...register("name", {
                      required: "Cluster name is required.",
                    })}
                    autoFocus
                    placeholder="my_production_cluster"
                    autoCorrect="off"
                    size="sm"
                    variant={formState.errors.name ? "error" : "default"}
                  />
                  <FormErrorMessage variant="spanColumns">
                    {formState.errors.name?.message}
                  </FormErrorMessage>
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
                        <Input
                          {...register(
                            `replicas.${index}.replicaName` as const,
                            {
                              required: true,
                              validate: {
                                unique: (value) => {
                                  const count = getValues()
                                    .replicas.map((r) => r.replicaName)
                                    .filter((name) => name === value).length;
                                  return count <= 1;
                                },
                              },
                            }
                          )}
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
                              ?.type
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
                        <Button
                          variant="formGutter"
                          onClick={() => remove(index)}
                        >
                          <CloseIcon height="8px" width="8px" />
                        </Button>
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
          </FullScreen>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default NewClusterForm;
