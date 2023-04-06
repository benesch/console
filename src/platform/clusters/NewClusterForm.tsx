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
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { alreadyExistsError } from "~/api/materialize/parseErrors";
import useAvailableClusterSizes from "~/api/materialize/useAvailableClusterSizes";
import useMaxReplicasPerCluster from "~/api/materialize/useMaxReplicasPerCluster";
import { useSqlLazy } from "~/api/materialized";
import FormInfoBox from "~/components/FormInfoBox";
import FormSection from "~/components/FormSection";
import FullScreen from "~/components/FullScreen";
import InlayBanner from "~/components/InlayBanner";
import SimpleSelect from "~/components/SimpleSelect";
import TextLink from "~/components/TextLink";
import FormTopBar from "~/components/TopBarForm";
import PlusCircleIcon from "~/svg/PlusCircleIcon";

type FormState = {
  name: string;
  replicas: {
    replicaName: string;
    replicaSize: string;
  }[];
};

const DEFAULT_SIZE_OPTION = "3xsmall";

const COLUMN_GAP = 60;
const REMOVE_BUTTON_WIDTH = 32;

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
            <Box>
              <Grid
                templateColumns="1fr 420px 1fr"
                templateRows="auto 1fr"
                columnGap={`${COLUMN_GAP}px`}
                rowGap="10"
                alignItems="start"
                justifyContent="center"
              >
                <Box
                  gridColumnStart="2"
                  fontWeight="600"
                  lineHeight="24px"
                  fontSize="20px"
                >
                  Cluster Information
                </Box>
                <Box gridColumnStart="2">
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
                      display="grid"
                      as={Grid}
                      templateColumns="auto max-content(320px)"
                      alignItems="center"
                    >
                      <FormLabel htmlFor="name" fontSize="sm" mb="0" mr="6">
                        Name
                      </FormLabel>
                      <Input
                        {...register("name", {
                          required: "Cluster name is required.",
                        })}
                        placeholder="my_production_cluster"
                        autoFocus
                        autoCorrect="off"
                        size="sm"
                        variant={formState.errors.name ? "error" : "default"}
                      />
                      <FormErrorMessage gridColumnStart="2">
                        {formState.errors.name?.message}
                      </FormErrorMessage>
                    </FormControl>
                  </FormSection>
                  <FormSection title="Cluster Replicas">
                    <VStack spacing="4">
                      {fields.map((field, index) => (
                        <Grid
                          key={field.id}
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
                                  required: "Replica name is required.",
                                }
                              )}
                              placeholder={`r${index + 1}`}
                              autoCorrect="off"
                              size="sm"
                              variant={
                                formState.errors.replicas?.[index]?.replicaName
                                  ? "error"
                                  : "default"
                              }
                            />
                            <FormErrorMessage gridColumnStart="2">
                              {
                                formState.errors.replicas?.[index]?.replicaName
                                  ?.message
                              }
                            </FormErrorMessage>
                          </FormControl>
                          <FormControl>
                            {clusterSizes && (
                              <SimpleSelect
                                {...register(
                                  `replicas.${index}.replicaSize` as const
                                )}
                              >
                                {clusterSizes &&
                                  clusterSizes.map((size) => (
                                    <option key={size} value={size}>
                                      {size}
                                    </option>
                                  ))}
                              </SimpleSelect>
                            )}
                          </FormControl>
                          {index > 0 && (
                            <Button
                              variant="borderless"
                              position="absolute"
                              right={`-${
                                COLUMN_GAP / 2 + REMOVE_BUTTON_WIDTH / 2
                              }px`}
                              minWidth={`${REMOVE_BUTTON_WIDTH}px`}
                              height={`${REMOVE_BUTTON_WIDTH}px`}
                              p="0"
                              onClick={() => remove(index)}
                            >
                              <CloseIcon height="8px" width="8px" />
                            </Button>
                          )}
                        </Grid>
                      ))}
                    </VStack>
                    <Button
                      mt="4"
                      variant="borderless"
                      isDisabled={
                        maxReplicas
                          ? getValues().replicas.length >= maxReplicas
                          : true
                      }
                      onClick={() =>
                        append({
                          replicaName: "",
                          replicaSize: DEFAULT_SIZE_OPTION,
                        })
                      }
                    >
                      <Box mr="2">
                        <PlusCircleIcon />
                      </Box>{" "}
                      Add cluster replica
                    </Button>
                  </FormSection>
                </Box>
                <FormInfoBox>
                  <Text>Need help connecting to Kafka?</Text>
                  <Text>
                    Check out our step-by-step guides or reach out to the team
                    for help with setting up your Kafka connection.
                  </Text>
                  <TextLink
                    href="https://materialize.com/docs/sql/create-cluster/"
                    target="_blank"
                    rel="noopener"
                  >
                    View cluster documentation –&gt;
                  </TextLink>
                </FormInfoBox>
              </Grid>
            </Box>
          </FullScreen>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default NewClusterForm;
