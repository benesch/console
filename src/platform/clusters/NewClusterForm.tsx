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
  Text,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import FormInfoBox from "~/components/FormInfoBox";
import FormSection from "~/components/FormSection";
import FullScreen from "~/components/FullScreen";
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

const SIZE_OPTIONS = [
  "2xsmall",
  "xsmall",
  "small",
  "medium",
  "large",
  "xlarge",
  "2xlarge",
  "3xlarge",
  "4xlarge",
  "5xlarge",
  "6xlarge",
];

const COLUMN_GAP = 60;
const REMOVE_BUTTON_WIDTH = 32;

const NewClusterForm = () => {
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit: handleSubmit,
    formState,
  } = useForm<FormState>({
    defaultValues: {
      name: "",
      replicas: [{ replicaName: "", replicaSize: SIZE_OPTIONS[0] }],
    },
    mode: "onTouched",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "replicas",
  });

  const handleValidSubmit = (values: FormState) => {
    console.log("submit", values);
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
                Create cluster
              </Button>
            </FormTopBar>
            <Box>
              <Grid
                templateColumns="1fr 420px 1fr"
                templateRows="auto 1fr"
                columnGap={`${COLUMN_GAP}px`}
                rowGap="40px"
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
                  <FormSection title="General">
                    <FormControl
                      isInvalid={!!formState.errors.name}
                      display="grid"
                      as={Grid}
                      templateColumns="auto fit-content(320px)"
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
                      <FormErrorMessage>
                        {formState.errors.name?.message}
                      </FormErrorMessage>
                    </FormControl>
                  </FormSection>
                  <FormSection title="Cluster Replicas">
                    <VStack spacing="4">
                      {fields.map((field, index) => (
                        <FormControl
                          key={field.id}
                          display="grid"
                          as={Grid}
                          templateColumns="1fr 1fr"
                          alignItems="center"
                          gap="16px"
                          position="relative"
                        >
                          <Box>
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
                                formState.errors.name ? "error" : "default"
                              }
                            />
                            <FormErrorMessage>
                              {formState.errors.name?.message}
                            </FormErrorMessage>
                          </Box>
                          <SimpleSelect
                            {...register(
                              `replicas.${index}.replicaSize` as const
                            )}
                          >
                            {SIZE_OPTIONS.map((size) => (
                              <option key={size} value={size}>
                                {size}
                              </option>
                            ))}
                          </SimpleSelect>
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
                        </FormControl>
                      ))}
                    </VStack>
                    <Button
                      mt="4"
                      variant="borderless"
                      onClick={() =>
                        append({
                          replicaName: "",
                          replicaSize: SIZE_OPTIONS[0],
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
