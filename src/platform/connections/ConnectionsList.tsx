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
import React, { useState } from "react";
import { Link, Route } from "react-router-dom";

import { useSegment } from "~/analytics/segment";
import {
  ConnectionsResponse,
  ConnectionWithDetails,
} from "~/api/materialize/connection/useConnections";
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
import { SentryRoutes } from "~/sentry";
import ConnectionIcon from "~/svg/ConnectionIcon";
import { MaterializeTheme } from "~/theme";
import useDelayedLoading from "~/useDelayedLoading";
import { SchemaObjectFilters } from "~/useSchemaObjectFilters";

import CreateConnectionSuccessModal from "./create/CreateConnectionSuccessModal";

const FiltersEmptyState = () => {
  const { colors } = useTheme<MaterializeTheme>();
  return (
    <EmptyListWrapper>
      <EmptyListHeader>
        <Circle p={2} bg={colors.background.secondary}>
          <ConnectionIcon width="6" height="6" color={colors.accent.purple} />
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
  const { colors } = useTheme<MaterializeTheme>();
  return (
    <EmptyListWrapper>
      <EmptyListHeader>
        <Circle p={2} bg={colors.background.secondary}>
          <ConnectionIcon width="6" height="6" color={colors.accent.purple} />
        </Circle>
        <EmptyListHeaderContents
          title="No available connections"
          helpText="Create a new connection to connect and authenticate to an external system."
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

type Props = {
  connectionsResponse: ConnectionsResponse;
  schemaObjectFilters: SchemaObjectFilters;
};

export const ConnectionsList = ({
  connectionsResponse,
  schemaObjectFilters,
}: Props) => {
  const { track } = useSegment();

  const {
    data: connections,
    isInitiallyLoading,
    isError,
    loading,
  } = connectionsResponse;

  const { databaseFilter, schemaFilter, nameFilter } = schemaObjectFilters;

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
        <HStack spacing="4">
          <DatabaseFilter {...databaseFilter} />
          <SchemaFilter {...schemaFilter} />
          <SearchInput
            name="connection"
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
          <Button
            as={Link}
            variant="primary"
            size="sm"
            to="new/connection"
            onClick={() => track("New Connection Clicked")}
          >
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
        <ConnectionsTable
          connections={connections ?? []}
          refetchConnections={connectionsResponse.refetch}
        />
      )}
      <SentryRoutes>
        <Route
          path="/show-connections-created"
          element={<CreateConnectionSuccessModal />}
        />
      </SentryRoutes>
    </>
  );
};

type ConnectionsTableProps = {
  connections: ConnectionWithDetails[];
  refetchConnections: () => void;
};

const ConnectionsTable = ({
  connections,
  refetchConnections,
}: ConnectionsTableProps) => {
  return (
    <Table variant="standalone">
      <Thead>
        <Tr>
          <Th width="25%">Name</Th>
          <Th width="25%">Type</Th>
          <Th width="25%">Sources</Th>
          <Th width="25%">Sinks</Th>
          <Th width={OVERFLOW_BUTTON_WIDTH}></Th>
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
              <Td>{connection.name}</Td>
              <Td>{connection.type}</Td>
              <Td>{connection.numSources}</Td>
              <Td>{connection.numSinks}</Td>
              <Td>
                <OverflowMenu>
                  <DeleteObjectMenuItem
                    selectedObject={connection}
                    refetchObjects={refetchConnections}
                    objectType="CONNECTION"
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

export default ConnectionsList;
