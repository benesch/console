import {
  Button,
  Circle,
  HStack,
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
} from "@chakra-ui/react";
import { format } from "date-fns";
import React from "react";

import { useSegment } from "~/analytics/segment";
import useSecretsListPage, {
  ListPageSecret,
} from "~/api/materialize/secret/useSecrets";
import DatabaseFilter from "~/components/DatabaseFilter";
import DeleteObjectMenuItem from "~/components/DeleteObjectMenuItem";
import ErrorBox from "~/components/ErrorBox";
import OverflowMenu, { OVERFLOW_BUTTON_WIDTH } from "~/components/OverflowMenu";
import SchemaFilter from "~/components/SchemaFilter";
import SearchInput from "~/components/SearchInput";
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

import NewSecretModal from "./NewSecretModal";

const NAME_FILTER_QUERY_STRING_KEY = "secretName";

const EmptyState = () => {
  const { colors } = useTheme<MaterializeTheme>();
  return (
    <EmptyListWrapper>
      <EmptyListHeader>
        <Circle p={2} bg={colors.background.secondary}>
          <LockIcon />
        </Circle>
        <EmptyListHeaderContents
          title="No available secrets"
          helpText="Create a new secret to store sensitive information in Materialize."
        />
        <Text
          fontSize="xs"
          textAlign="center"
          color={colors.foreground.secondary}
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

export const SecretsList = () => {
  const { track } = useSegment();
  const { databaseFilter, schemaFilter, nameFilter } = useSchemaObjectFilters(
    NAME_FILTER_QUERY_STRING_KEY
  );
  const {
    data: secrets,
    isInitiallyLoading,
    refetch,
    isError,
    loading,
  } = useSecretsListPage({
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
        <HStack spacing="4">
          <DatabaseFilter {...databaseFilter} />
          <SchemaFilter {...schemaFilter} />
          <SearchInput
            name="sink"
            value={nameFilter.name}
            onChange={(e) => {
              nameFilter.setName(e.target.value);
            }}
          />
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onOpen();
              track("New Secret Clicked");
            }}
          >
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
        <SecretsTable refetchSecrets={refetch} secrets={secrets ?? []} />
      )}
      <NewSecretModal
        isOpen={isOpen}
        onClose={onClose}
        onPrimaryButtonAction={handleSecretCreation}
      />
    </>
  );
};

export interface SecretsTableProps {
  secrets: ListPageSecret[];
  refetchSecrets: () => void;
}

const SecretsTable = ({ secrets, refetchSecrets }: SecretsTableProps) => {
  return (
    <Table variant="standalone">
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Created</Th>
          <Th width={OVERFLOW_BUTTON_WIDTH}></Th>
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
              <Td>
                <OverflowMenu>
                  <DeleteObjectMenuItem
                    selectedObject={secret}
                    refetchObjects={refetchSecrets}
                    objectType="SECRET"
                  />
                </OverflowMenu>
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

export default SecretsList;
