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
import { useNavigate } from "react-router-dom";
import { useRecoilValue_TRANSITION_SUPPORT_UNSTABLE } from "recoil";

import { Source } from "~/api/materialize/useSources";
import { Card, CardContent, CardHeader } from "~/components/cardComponents";
import { CodeBlock } from "~/components/copyableComponents";
import DatabaseFilter from "~/components/DatabaseFilter";
import SchemaFilter from "~/components/SchemaFilter";
import SearchInput from "~/components/SearchInput";
import StatusPill from "~/components/StatusPill";
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
import { currentEnvironmentState } from "~/recoil/environments";
import { useRegionSlug } from "~/region";
import SourcesIcon from "~/svg/Sources";
import { MaterializeTheme } from "~/theme";
import useDelayedLoading from "~/useDelayedLoading";
import {
  DatabaseFilterState,
  NameFilterState,
  SchemaFilterState,
} from "~/useSchemaObjectFilters";

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
  sources: Source[] | null;
  loading: boolean;
  isPolling: boolean;
}

const SourcesListPage = ({
  databaseFilter,
  nameFilter,
  schemaFilter,
  sources,
  loading,
  isPolling,
}: SourceListProps) => {
  const { colors } = useTheme<MaterializeTheme>();
  const currentEnvironment = useRecoilValue_TRANSITION_SUPPORT_UNSTABLE(
    currentEnvironmentState
  );
  const showLoading = useDelayedLoading(!isPolling && loading);

  const isDisabled = currentEnvironment?.state !== "enabled";
  const isInitialLoad = sources === null;
  const isLoading = isInitialLoad || showLoading;
  const isEmpty = !isLoading && sources.length === 0;

  return (
    <>
      <PageHeader>
        <PageHeading>Sources</PageHeading>
        <HStack gap="16px">
          <HStack gap="0px">
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
        </HStack>
      </PageHeader>
      {isLoading && !isEmpty && !isDisabled && (
        <Spinner data-testid="loading-spinner" />
      )}
      {isEmpty && !isDisabled && (
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
      )}
      {!isLoading && !isEmpty && !isDisabled && (
        <HStack spacing={6} alignItems="flex-start">
          <SourceTable sources={sources} />
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
}

const SourceTable = (props: SourceTableProps) => {
  const navigate = useNavigate();
  const regionSlug = useRegionSlug();

  return (
    <Table variant="standalone" data-testid="source-table" borderRadius="xl">
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th width="25%">Status</Th>
          <Th width="25%">Type</Th>
          <Th width="25%">Size</Th>
        </Tr>
      </Thead>
      <Tbody>
        {props.sources.map((s) => (
          <Tr
            key={s.id}
            onClick={() => navigate(sourceErrorsPath(regionSlug, s))}
            cursor="pointer"
          >
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
                <Tooltip
                  label={`${s.databaseName}.${s.schemaName}.${s.name}`}
                  placement="bottom"
                  fontSize="xs"
                  top={-1}
                >
                  {s.name}
                </Tooltip>
              </Box>
            </Td>
            <Td>{s.status ? <StatusPill status={s.status} /> : "-"}</Td>
            <Td>{s.type}</Td>
            <Td>{s.size || "-"}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default SourcesListPage;
