import {
  Box,
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
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { Link } from "react-router-dom";

import { Sink, SinksResponse } from "~/api/materialize/sink/useSinks";
import { Card, CardContent, CardHeader } from "~/components/cardComponents";
import { CodeBlock } from "~/components/copyableComponents";
import DatabaseFilter from "~/components/DatabaseFilter";
import DeleteObjectMenuItem from "~/components/DeleteObjectMenuItem";
import ErrorBox from "~/components/ErrorBox";
import OverflowMenu from "~/components/OverflowMenu";
import SchemaFilter from "~/components/SchemaFilter";
import SearchInput from "~/components/SearchInput";
import StatusPill, {
  getConnectorBackgroundColor,
  getConnectorTextColor,
  getSourceIcon,
} from "~/components/StatusPill";
import TextLink from "~/components/TextLink";
import { PageHeader, PageHeading } from "~/layouts/BaseLayout";
import {
  EmptyListHeader,
  EmptyListHeaderContents,
  EmptyListWrapper,
  IconBox,
  SampleCodeBoxWrapper,
  SQLSuggestion,
  SQLSuggestionBox,
} from "~/layouts/listPageComponents";
import { useRegionSlug } from "~/region";
import SinksIcon from "~/svg/Sinks";
import { MaterializeTheme } from "~/theme";
import useDelayedLoading from "~/useDelayedLoading";
import {
  DatabaseFilterState,
  NameFilterState,
  SchemaFilterState,
} from "~/useSchemaObjectFilters";

import { SINKS_FETCH_ERROR_MESSAGE } from "./constants";
import { sinkErrorsPath } from "./SinkRoutes";

const SINK_CREATE_SQL = `CREATE SINK <sink_name>
  FROM <view_name>
  INTO <item_name>
  FORMAT <format>
  ENVELOPE <envelope>
  WITH (SIZE = 'xsmall');`;

const sinkSuggestions: SQLSuggestion[] = [
  {
    title: "View sinks",
    string: "SHOW SINKS;",
  },
  {
    title: "Create a sink",
    string: SINK_CREATE_SQL,
  },
  {
    title: "Drop a sink",
    string: "DROP SINK <sink_name>;",
  },
];

interface SinkListProps {
  databaseFilter: DatabaseFilterState;
  nameFilter: NameFilterState;
  schemaFilter: SchemaFilterState;
  sinksResponse: SinksResponse;
  isPolling?: boolean;
}

const SinksListPage = ({
  databaseFilter,
  nameFilter,
  schemaFilter,
  sinksResponse,
  isPolling,
}: SinkListProps) => {
  const { colors } = useTheme<MaterializeTheme>();
  const { data: sinks, loading, isInitiallyLoading, isError } = sinksResponse;

  const isFetching = useDelayedLoading(loading && !isPolling);

  const isLoading = isInitiallyLoading || isFetching;
  const isEmpty = sinks && sinks.length === 0;

  return (
    <>
      <PageHeader>
        <PageHeading>Sinks</PageHeading>
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
        </HStack>
      </PageHeader>
      {isError ? (
        <ErrorBox message={SINKS_FETCH_ERROR_MESSAGE} />
      ) : isLoading ? (
        <Spinner data-testid="loading-spinner" />
      ) : isEmpty ? (
        <EmptyListWrapper>
          <EmptyListHeader>
            <IconBox type="Empty">
              <Box mt="1px">
                <SinksIcon />
              </Box>
            </IconBox>
            <EmptyListHeaderContents
              title="No available sinks"
              helpText="Create a sink to begin streaming data out of Materialize."
            />
          </EmptyListHeader>
          <SampleCodeBoxWrapper docsUrl="//materialize.com/docs/sql/create-sink/">
            <CodeBlock
              title="Create a sink"
              contents={SINK_CREATE_SQL}
              lineNumbers
            />
          </SampleCodeBoxWrapper>
        </EmptyListWrapper>
      ) : (
        <HStack spacing={6} alignItems="flex-start">
          <SinkTable sinks={sinks || []} refetchSinks={sinksResponse.refetch} />
          <Card flex={0} minW="384px" maxW="384px">
            <CardHeader>Interacting with sinks</CardHeader>
            <CardContent pb={8}>
              <VStack spacing={4} alignItems="stretch" fontSize="sm">
                <Text color={colors.foreground.secondary}>
                  A sink describes an external system you want Materialize to
                  read data from.
                </Text>
                <Text color={colors.foreground.secondary}>
                  Having trouble?{" "}
                  <TextLink
                    href="https://materialize.com/docs/overview/key-concepts/#sinks"
                    target="_blank"
                  >
                    View the documentation.
                  </TextLink>
                </Text>
                {sinkSuggestions.map((suggestion) => (
                  <SQLSuggestionBox
                    key={`suggestion-${suggestion.title}`}
                    {...suggestion}
                  />
                ))}
              </VStack>
            </CardContent>
          </Card>
        </HStack>
      )}
    </>
  );
};

interface SinkTableProps {
  sinks: Sink[];
  refetchSinks: () => void;
}

const SinkTable = (props: SinkTableProps) => {
  const regionSlug = useRegionSlug();

  return (
    <Table variant="standalone" data-testid="sink-table" borderRadius="xl">
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th width="25%">Status</Th>
          <Th>Type</Th>
          <Th>Size</Th>
          <Th width="80px"></Th>
        </Tr>
      </Thead>
      <Tbody>
        {props.sinks.map((s) => (
          <Tr key={s.id}>
            <Td>
              <Box
                maxW={{
                  base: "120px",
                  xl: "200px",
                  "2xl": "400px",
                  "3xl": "800px",
                  "4xl": "1200px",
                }}
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                <Link to={sinkErrorsPath(regionSlug, s)}>
                  <Tooltip
                    label={`${s.databaseName}.${s.schemaName}.${s.name}`}
                    placement="bottom"
                    fontSize="xs"
                    top={-1}
                  >
                    {s.name}
                  </Tooltip>
                </Link>
              </Box>
            </Td>
            <Td>
              {s.status ? (
                <StatusPill
                  status={s.status}
                  backgroundColor={getConnectorBackgroundColor(s.status)}
                  textColor={getConnectorTextColor(s.status)}
                  icon={getSourceIcon(s.status)}
                />
              ) : (
                "-"
              )}
            </Td>
            <Td>{s.type}</Td>
            <Td>{s.size || "-"}</Td>
            <Td>
              <OverflowMenu>
                <DeleteObjectMenuItem
                  selectedObject={s}
                  refetchObjects={props.refetchSinks}
                  objectType="SINK"
                />
              </OverflowMenu>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default SinksListPage;
