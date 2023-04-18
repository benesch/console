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
  useTheme,
} from "@chakra-ui/react";
import React, { useState } from "react";

import useConnections, { Connection } from "~/api/materialize/useConnections";
import DatabaseFilter from "~/components/DatabaseFilter";
import ErrorBox from "~/components/ErrorBox";
import SchemaFilter from "~/components/SchemaFilter";
import SearchInput from "~/components/SearchInput";
import TextLink from "~/components/TextLink";
import { PageHeader, PageHeading } from "~/layouts/BaseLayout";
import {
  EmptyListHeader,
  EmptyListHeaderContents,
  EmptyListWrapper,
} from "~/layouts/listPageComponents";
import ConnectionIcon from "~/svg/ConnectionIcon";
import { MaterializeTheme } from "~/theme";
import useDelayedLoading from "~/useDelayedLoading";
import useSchemaObjectFilters from "~/useSchemaObjectFilters";

const NAME_FILTER_QUERY_STRING_KEY = "connectionName";

const FiltersEmptyState = () => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  return (
    <EmptyListWrapper>
      <EmptyListHeader>
        <Circle p={2} bg={semanticColors.background.secondary}>
          <ConnectionIcon
            width={24}
            height={24}
            color={semanticColors.accent.purple}
          />
        </Circle>
        <EmptyListHeaderContents
          title="No available connections"
          helpText="There are no connections saved in this namespace. Try looking elsewhere or create a new one."
        />
      </EmptyListHeader>
    </EmptyListWrapper>
  );
};

const EmptyState = () => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  return (
    <EmptyListWrapper>
      <EmptyListHeader>
        <Circle p={2} bg={semanticColors.background.secondary}>
          <ConnectionIcon
            width={24}
            height={24}
            color={semanticColors.accent.purple}
          />
        </Circle>
        <EmptyListHeaderContents
          title="No available connections"
          helpText="Create a new connection to connect and authenticate to an external system."
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

export const ConnectionsList = () => {
  const { databaseFilter, schemaFilter, nameFilter } = useSchemaObjectFilters(
    NAME_FILTER_QUERY_STRING_KEY
  );
  const {
    data: connections,
    isInitiallyLoading,
    isError,
    loading,
  } = useConnections({
    databaseId: databaseFilter.selected?.id,
    schemaId: schemaFilter.selected?.id,
    nameFilter: nameFilter.name,
  });

  const [hasNameFilterReset, setHasNameFilterReset] = useState(false);

  const hasFilterChanged =
    !!databaseFilter.selected ||
    !!schemaFilter.selected ||
    !!nameFilter.name?.length ||
    hasNameFilterReset;

  const isConnectionsEmpty = connections && connections.length === 0;

  const hasNoResults = hasFilterChanged && isConnectionsEmpty;
  const isFetching = useDelayedLoading(loading);
  const isLoading = isInitiallyLoading || isFetching;

  return (
    <>
      <PageHeader>
        <PageHeading>Connections</PageHeading>
        <HStack>
          <DatabaseFilter {...databaseFilter} />
          <SchemaFilter {...schemaFilter} />
          <SearchInput
            name="sink"
            value={nameFilter.name ?? ""}
            onChange={(e) => {
              const newName = e.target.value;
              if (newName.length === 0 && (nameFilter.name ?? "").length > 0) {
                setHasNameFilterReset(true);
              }
              nameFilter.setName(newName);
            }}
            onBlur={() => {
              setHasNameFilterReset(false);
            }}
          />
          {/* TODO(#41): Add access to connection creation*/}
          <Button variant="primary" size="sm">
            New connection
          </Button>
        </HStack>
      </PageHeader>
      {isError ? (
        <ErrorBox message="An error occurred loading connections" />
      ) : isLoading ? (
        <Spinner data-testid="loading-spinner" />
      ) : hasNoResults ? (
        <FiltersEmptyState />
      ) : isConnectionsEmpty ? (
        <EmptyState />
      ) : (
        <ConnectionsTable connections={connections ?? []} />
      )}
    </>
  );
};

type ConnectionsTableProps = {
  connections: Connection[];
};

const ConnectionsTable = ({ connections }: ConnectionsTableProps) => {
  return (
    <Table variant="standalone">
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Type</Th>
          <Th>Sources</Th>
          <Th>Sinks</Th>
        </Tr>
      </Thead>
      <Tbody>
        {connections.map((connection) => {
          return (
            <Tr
              key={connection.id}
              textColor="default"
              aria-label={connection.name}
            >
              <Td width="25%">
                <Tooltip
                  label={`${connection.databaseName}.${connection.schemaName}.${connection.name}`}
                  placement="bottom"
                  fontSize="xs"
                  top={-1}
                >
                  {connection.name}
                </Tooltip>
              </Td>
              <Td width="25%">{connection.type}</Td>
              <Td width="25%">{connection.numSources}</Td>
              <Td width="25%">{connection.numSinks}</Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

export default ConnectionsList;
