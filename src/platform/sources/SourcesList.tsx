import {
  Box,
  Button,
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
import { useFlags } from "launchdarkly-react-client-sdk";
import React from "react";
import { Link } from "react-router-dom";

import { useSegment } from "~/analytics/segment";
import { Source, SourcesResponse } from "~/api/materialize/useSources";
import { Card, CardContent, CardHeader } from "~/components/cardComponents";
import { CodeBlock } from "~/components/copyableComponents";
import DatabaseFilter from "~/components/DatabaseFilter";
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
import SourcesIcon from "~/svg/Sources";
import { MaterializeTheme } from "~/theme";
import useDelayedLoading from "~/useDelayedLoading";
import {
  DatabaseFilterState,
  NameFilterState,
  SchemaFilterState,
} from "~/useSchemaObjectFilters";

import { SOURCES_FETCH_ERROR_MESSAGE } from "./constants";
import { sourceErrorsPath } from "./SourceRoutes";

const sourcesSuggestions: SQLSuggestion[] = [
  {
    title: "View sources",
    string: "SHOW SOURCES;",
  },
  {
    title: "Create a source",
    string: `CREATE SOURCE <source_name>
  FROM <source_connection>
  FORMAT <format_type>
  WITH (SIZE='3xsmall');`,
  },
  {
    title: "Drop a source",
    string: "DROP SOURCE <source_name>;",
  },
];

interface SourceListProps {
  databaseFilter: DatabaseFilterState;
  nameFilter: NameFilterState;
  schemaFilter: SchemaFilterState;
  sourcesResponse: SourcesResponse;
  isPolling?: boolean;
}

const SourcesListPage = ({
  databaseFilter,
  nameFilter,
  schemaFilter,
  sourcesResponse,
  isPolling,
}: SourceListProps) => {
  const { colors } = useTheme<MaterializeTheme>();
  const flags = useFlags();
  const { track } = useSegment();

  const {
    data: sources,
    isInitiallyLoading,
    isError,
    loading,
    refetch,
  } = sourcesResponse;

  const isEmpty = sources && sources.length === 0;

  const isFetching = useDelayedLoading(loading && !isPolling);

  return (
    <>
      <PageHeader>
        <PageHeading>Sources</PageHeading>
        <HStack spacing="4">
          <HStack>
            <DatabaseFilter {...databaseFilter} />
            <SchemaFilter {...schemaFilter} />
          </HStack>
          <SearchInput
            name="source"
            value={nameFilter.name}
            onChange={(e) => {
              nameFilter.setName(e.target.value);
            }}
          />
          {flags["source-creation-41"] && (
            <Button
              variant="primary"
              size="sm"
              as={Link}
              to="new/connection"
              onClick={() => track("New Source Clicked")}
            >
              New Source
            </Button>
          )}
        </HStack>
      </PageHeader>
      {isError ? (
        <ErrorBox message={SOURCES_FETCH_ERROR_MESSAGE} />
      ) : isInitiallyLoading || isFetching ? (
        <Spinner data-testid="loading-spinner" />
      ) : isEmpty ? (
        <EmptyListWrapper>
          <EmptyListHeader>
            <IconBox type="Empty">
              <Box mt="-1px">
                <SourcesIcon />
              </Box>
            </IconBox>
            <EmptyListHeaderContents
              title="No available sources"
              helpText="Connect a source to begin streaming data to Materialize."
            />
          </EmptyListHeader>
          <SampleCodeBoxWrapper docsUrl="//materialize.com/docs/sql/create-source/">
            <CodeBlock
              title="Create a source"
              contents={`CREATE CONNECTION <connection_name>
  TO <connection_type> (<options>);

CREATE SOURCE <source_name>
  FROM <source>
  FORMAT <format>;
  WITH (SIZE = '3xsmall');`}
              lineNumbers
            />
          </SampleCodeBoxWrapper>
        </EmptyListWrapper>
      ) : (
        <HStack spacing={6} alignItems="flex-start">
          <SourceTable sources={sources ?? []} refetchSources={refetch} />
          <Card flex={0} minW="384px" maxW="384px">
            <CardHeader>Interacting with sources</CardHeader>
            <CardContent pb={8}>
              <VStack spacing={4} alignItems="stretch" fontSize="sm">
                <Text color={colors.semanticColors.foreground.secondary}>
                  A source describes an external system you want Materialize to
                  read data from.
                </Text>
                <Text color={colors.semanticColors.foreground.secondary}>
                  Having trouble?{" "}
                  <TextLink
                    href="https://materialize.com/docs/overview/key-concepts/#sources"
                    target="_blank"
                  >
                    View the documentation.
                  </TextLink>
                </Text>
                {sourcesSuggestions.map((suggestion) => (
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

interface SourceTableProps {
  sources: Source[];
  refetchSources: () => void;
}

const SourceTable = (props: SourceTableProps) => {
  const regionSlug = useRegionSlug();

  return (
    <Table variant="standalone" data-testid="source-table" borderRadius="xl">
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th width="25%">Status</Th>
          <Th width="25%">Type</Th>
          <Th width="25%">Size</Th>
          <Th width="80px"></Th>
        </Tr>
      </Thead>
      <Tbody>
        {props.sources.map((s) => (
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
                <Link to={sourceErrorsPath(regionSlug, s)}>
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
              <OverflowMenu
                selectedObject={s}
                refetchObjects={props.refetchSources}
                objectType="SOURCE"
              />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default SourcesListPage;
