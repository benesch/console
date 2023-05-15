import {
  Button,
  Circle,
  FormControl,
  FormErrorMessage,
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
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import { format } from "date-fns";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

import useSecrets, {
  createSecretQueryBuilder,
  Secret,
} from "~/api/materialize/useSecrets";
import { MATERIALIZE_DATABASE_IDENTIFIER_REGEX } from "~/api/materialize/validation";
import { useSqlLazy } from "~/api/materialized";
import DatabaseFilter from "~/components/DatabaseFilter";
import ErrorBox from "~/components/ErrorBox";
import InlayBanner from "~/components/InlayBanner";
import ObjectNameInput from "~/components/ObjectNameInput";
import SchemaFilter from "~/components/SchemaFilter";
import SearchInput from "~/components/SearchInput";
import { useSuccessToast } from "~/components/SuccessToast";
import TextLink from "~/components/TextLink";
import { PageHeader, PageHeading } from "~/layouts/BaseLayout";
import {
  EmptyListHeader,
  EmptyListHeaderContents,
  EmptyListWrapper,
} from "~/layouts/listPageComponents";
import LockIcon from "~/svg/Lock";
import { MaterializeTheme } from "~/theme";
import useDelayedLoading from "~/useDelayedLoading";
import useSchemaObjectFilters from "~/useSchemaObjectFilters";

const NAME_FILTER_QUERY_STRING_KEY = "secretName";

import { serverErrorToUserError } from "./serverErrorToUserError";

type FormValues = {
  name: string;
  value: string;
};

const EmptyState = () => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  return (
    <EmptyListWrapper>
      <EmptyListHeader>
        <Circle p={2} bg={semanticColors.background.secondary}>
          <LockIcon />
        </Circle>
        <EmptyListHeaderContents
          title="No available secrets"
          helpText="Create a new secret to store sensitive information in Materialize."
        />
        <Text
          fontSize="xs"
          textAlign="center"
          color={semanticColors.foreground.secondary}
        >
          Need help?{" "}
          <TextLink
            href="//materialize.com/docs/sql/create-secret/"
            target="_blank"
          >
            View the documentation.
          </TextLink>
        </Text>
      </EmptyListHeader>
    </EmptyListWrapper>
  );
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

const SecretsCreationModal = ({
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

  const { shadows } = useTheme<MaterializeTheme>();

  const {
    register,
    handleSubmit: handleSubmit,
    reset: formReset,
    formState,
    setError,
    setFocus,
  } = useForm<FormValues>({
    mode: "onTouched",
  });

  const { runSql: createSecret, loading: isCreationInFlight } = useSqlLazy({
    queryBuilder: createSecretQueryBuilder,
  });

  const handleValidSubmit = async (formValues: FormValues) => {
    setShowGenericQueryError(false);
    createSecret(formValues, {
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

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
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
                  message="There was an error creating a secret key. Please try again."
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
                  <Text
                    mt="2"
                    textStyle="text-ui-reg"
                    color="semanticColors.foreground.secondary"
                  >
                    Alphanumeric characters and underscores only.
                  </Text>
                )}
                <FormErrorMessage>
                  {formState.errors.name?.message}
                </FormErrorMessage>
              </FormControl>
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
              <Button variant="secondary" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isDisabled={isCreationInFlight}
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

export const SecretsList = () => {
  const { databaseFilter, schemaFilter, nameFilter } = useSchemaObjectFilters(
    NAME_FILTER_QUERY_STRING_KEY
  );
  const {
    data: secrets,
    isInitiallyLoading,
    refetch,
    isError,
    loading,
  } = useSecrets({
    databaseId: databaseFilter.selected?.id,
    schemaId: schemaFilter.selected?.id,
    nameFilter: nameFilter.name,
  });

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSecretCreation = () => {
    onClose();
    refetch();
  };

  const isEmpty = secrets && secrets.length === 0;
  const isFetching = useDelayedLoading(loading);
  const isLoading = isInitiallyLoading || isFetching;

  return (
    <>
      <PageHeader>
        <PageHeading>Secrets</PageHeading>
        <HStack>
          <DatabaseFilter {...databaseFilter} />
          <SchemaFilter {...schemaFilter} />
          <SearchInput
            name="sink"
            value={nameFilter.name}
            onChange={(e) => {
              nameFilter.setName(e.target.value);
            }}
          />
          <Button variant="primary" size="sm" onClick={onOpen}>
            New secret
          </Button>
        </HStack>
      </PageHeader>
      {isError ? (
        <ErrorBox message="An error occurred loading secrets" />
      ) : isLoading ? (
        <Spinner data-testid="loading-spinner" />
      ) : isEmpty ? (
        <EmptyState />
      ) : (
        <SecretsTable secrets={secrets ?? []} />
      )}
      <SecretsCreationModal
        isOpen={isOpen}
        onClose={onClose}
        onPrimaryButtonAction={handleSecretCreation}
      />
    </>
  );
};

type SecretsTableProps = {
  secrets: Secret[];
};

const SecretsTable = ({ secrets }: SecretsTableProps) => {
  return (
    <Table variant="standalone">
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Created</Th>
        </Tr>
      </Thead>
      <Tbody>
        {secrets.map((secret) => {
          return (
            <Tr key={secret.id} textColor="default" aria-label={secret.name}>
              <Td>
                <Tooltip
                  label={`${secret.databaseName}.${secret.schemaName}.${secret.name}`}
                  placement="bottom"
                  fontSize="xs"
                  top={-1}
                >
                  {secret.name}
                </Tooltip>
              </Td>
              <Td width="25%">
                <Text>{format(secret.createdAt, "MMM d, yyyy")}</Text>
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

export default SecretsList;
