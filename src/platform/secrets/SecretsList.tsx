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
  Tr,
  useTheme,
} from "@chakra-ui/react";
import React from "react";

import { Secret, useSecrets } from "~/api/materialized";
import DatabaseFilter from "~/components/DatabaseFilter";
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

const NAME_FILTER_QUERY_STRING_KEY = "secretName";

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

const SecretsList = () => {
  const { databaseFilter, schemaFilter, nameFilter } = useSchemaObjectFilters(
    NAME_FILTER_QUERY_STRING_KEY
  );
  const { data: secrets, loading } = useSecrets({
    databaseId: databaseFilter.selected?.id,
    schemaId: schemaFilter.selected?.id,
    nameFilter: nameFilter.name,
  });

  const showLoading = useDelayedLoading(loading);

  const isInitialLoad = secrets === null;

  const isEmpty = !isInitialLoad && secrets.length === 0;

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
          {/* TODO: Add handler for Secret creation flow(issue#17) */}
          <Button variant="primary" size="sm">
            New secret
          </Button>
        </HStack>
      </PageHeader>
      {showLoading || isInitialLoad ? (
        <Spinner data-testid="loading-spinner" />
      ) : isEmpty ? (
        <EmptyState />
      ) : (
        <SecretsTable secrets={secrets} />
      )}
    </>
  );
};

type SecretsTableProps = {
  secrets: Secret[];
};

const SecretsTable = ({ secrets }: SecretsTableProps) => {
  const { colors } = useTheme<MaterializeTheme>();

  return (
    <Table variant="standalone">
      <Thead>
        <Tr>
          <Th>Name</Th>
        </Tr>
      </Thead>
      <Tbody>
        {secrets.map((secret) => {
          return (
            <Tr key={secret.id} textColor="default" aria-label={secret.name}>
              <Td
                borderBottomWidth="1px"
                borderBottomColor={colors.semanticColors.border.primary}
              >
                {secret.name}
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

export default SecretsList;
