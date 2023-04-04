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

import { Sink } from "~/api/materialized";
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
import SinksIcon from "~/svg/Sinks";
import { MaterializeTheme } from "~/theme";
import useDelayedLoading from "~/useDelayedLoading";
import {
  DatabaseFilterState,
  NameFilterState,
  SchemaFilterState,
} from "~/useSchemaObjectFilters";

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
  sinks: Sink[] | null;
  loading: boolean;
  isPolling: boolean;
}

const SinksListPage = ({
  databaseFilter,
  nameFilter,
  schemaFilter,
  sinks,
  loading,
  isPolling,
}: SinkListProps) => {
  const { colors } = useTheme<MaterializeTheme>();
  const currentEnvironment = useRecoilValue_TRANSITION_SUPPORT_UNSTABLE(
    currentEnvironmentState
  );

  const showLoading = useDelayedLoading(!isPolling && loading);

  const isDisabled = currentEnvironment?.state !== "enabled";
  const isInitialLoad = sinks === null;
  const isLoading = isInitialLoad || showLoading;
  const isEmpty = !isLoading && sinks.length === 0;

  return (
    <>
      <PageHeader>
        <PageHeading>Sinks</PageHeading>
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
        </HStack>
      </PageHeader>
      {isLoading && !isEmpty && !isDisabled && (
        <Spinner data-testid="loading-spinner" />
      )}
      {isEmpty && !isDisabled && (
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
      )}
      {!isLoading && !isEmpty && !isDisabled && (
        <HStack spacing={6} alignItems="flex-start">
          <SinkTable sinks={sinks} />
          <Card flex={0} minW="384px" maxW="384px">
            <CardHeader>Interacting with sinks</CardHeader>
            <CardContent pb={8}>
              <VStack spacing={4} alignItems="stretch" fontSize="sm">
                <Text color={colors.semanticColors.foreground.secondary}>
                  A sink describes an external system you want Materialize to
                  read data from.
                </Text>
                <Text color={colors.semanticColors.foreground.secondary}>
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
}

const SinkTable = (props: SinkTableProps) => {
  const navigate = useNavigate();
  const regionSlug = useRegionSlug();

  return (
    <Table variant="standalone" data-testid="sink-table" borderRadius="xl">
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th width="25%">Status</Th>
          <Th>Type</Th>
          <Th>Size</Th>
        </Tr>
      </Thead>
      <Tbody>
        {props.sinks.map((s) => (
          <Tr
            key={s.id}
            onClick={() => navigate(sinkErrorsPath(regionSlug, s))}
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

export default SinksListPage;
