import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useController, useForm } from "react-hook-form";

import { useSegment } from "~/analytics/segment";
import { createSecretQueryBuilder } from "~/api/materialize/secret/createSecrets";
import useSchemas, {
  isDefaultSchema,
  Schema,
} from "~/api/materialize/useSchemas";
import { MATERIALIZE_DATABASE_IDENTIFIER_REGEX } from "~/api/materialize/validation";
import { useSqlLazy } from "~/api/materialized";
import ErrorBox from "~/components/ErrorBox";
import InlayBanner from "~/components/InlayBanner";
import ObjectNameInput from "~/components/ObjectNameInput";
import SchemaSelect from "~/components/SchemaSelect";
import { useSuccessToast } from "~/components/SuccessToast";
import { MaterializeTheme } from "~/theme";

import { serverErrorToUserError } from "./serverErrorToUserError";

type FormValues = {
  name: string;
  schema: Schema;
  value: string;
};

const SuccessToastDescription = ({ secretName }: { secretName: string }) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  return (
    <>
      <Text color={semanticColors.foreground.primary} as="span">
        {secretName}{" "}
      </Text>
      created successfully
    </>
  );
};

const NAME_FIELD = "name";
const VALUE_FIELD = "value";

const NewSecretModal = ({
  isOpen,
  onClose,
  onPrimaryButtonAction,
}: {
  isOpen: boolean;
  onClose: () => void;
  onPrimaryButtonAction: () => void;
}) => {
  const [showGenericQueryError, setShowGenericQueryError] = useState(false);
  const toast = useSuccessToast();

  const {
    shadows,
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  const { track } = useSegment();

  const {
    control,
    register,
    handleSubmit: handleSubmit,
    reset: formReset,
    formState,
    setError,
    setFocus,
  } = useForm<FormValues>({
    mode: "onTouched",
  });

  const { data: schemas, error: loadSchemasError } = useSchemas();

  const { runSql: createSecret, loading: isCreationInFlight } = useSqlLazy({
    queryBuilder: createSecretQueryBuilder,
  });

  const handleClose = () => {
    formReset();
    onClose();
  };

  const handleValidSubmit = async (formValues: FormValues) => {
    setShowGenericQueryError(false);
    const variables = {
      name: formValues.name,
      databaseName: formValues.schema.databaseName,
      schemaName: formValues.schema.name,
      value: formValues.value,
    };
    createSecret(variables, {
      onSuccess: () => {
        onPrimaryButtonAction();
        toast({
          description: <SuccessToastDescription secretName={formValues.name} />,
        });
        formReset();
      },
      onError: (errorMessage) => {
        const userErrorMessage = serverErrorToUserError(errorMessage);
        if (userErrorMessage === null) {
          setShowGenericQueryError(true);
        } else {
          setError(NAME_FIELD, {
            message: userErrorMessage,
          });
          setFocus(NAME_FIELD);
        }
      },
    });
  };
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

  if (loadSchemasError) {
    return <ErrorBox />;
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent shadow={shadows.level4}>
        <form onSubmit={handleSubmit(handleValidSubmit)}>
          <ModalHeader>Create a secret</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack pb={6} spacing="4">
              {showGenericQueryError && (
                <InlayBanner
                  variant="error"
                  label="Error"
                  message="There was an error creating a secret name. Please try again."
                />
              )}
              <FormControl isInvalid={!!formState.errors.name}>
                <FormLabel fontSize="sm">Name</FormLabel>
                <ObjectNameInput
                  {...register(NAME_FIELD, {
                    required: "Name is required.",
                    pattern: {
                      value: MATERIALIZE_DATABASE_IDENTIFIER_REGEX,
                      message: "Name must not include special characters",
                    },
                  })}
                  placeholder="confluent_password"
                  autoFocus={isOpen}
                  autoCorrect="off"
                  size="sm"
                  variant={formState.errors.name ? "error" : "default"}
                />
                {!formState.errors.name && (
                  <FormHelperText>
                    Alphanumeric characters and underscores only.
                  </FormHelperText>
                )}
                <FormErrorMessage>
                  {formState.errors.name?.message}
                </FormErrorMessage>
              </FormControl>
              <Accordion
                allowToggle
                index={formState.errors.schema ? 0 : undefined}
                width="100%"
              >
                <AccordionItem>
                  <AccordionButton
                    py="2"
                    color={semanticColors.accent.brightPurple}
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
                        variant={formState.errors.schema ? "error" : "default"}
                      />
                      <FormErrorMessage>
                        {formState.errors.schema?.message}
                      </FormErrorMessage>
                    </FormControl>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
              <FormControl isInvalid={!!formState.errors.value}>
                <FormLabel fontSize="sm">Value</FormLabel>
                <Input
                  {...register(VALUE_FIELD, {
                    required: "Value is required.",
                  })}
                  autoCorrect="off"
                  size="sm"
                  variant={formState.errors.value ? "error" : "default"}
                />
                <FormErrorMessage>
                  {formState.errors.value?.message}
                </FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing="2">
              <Button variant="secondary" size="sm" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isDisabled={isCreationInFlight}
                onClick={() => track("Create Secret Clicked")}
              >
                Create secret
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default NewSecretModal;
