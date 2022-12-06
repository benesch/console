import { WarningIcon } from "@chakra-ui/icons";
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
  Tr,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue_TRANSITION_SUPPORT_UNSTABLE } from "recoil";

import { Source, SourceStatus, useSources } from "~/api/materialized";
import { Card, CardContent, CardHeader } from "~/components/cardComponents";
import { CodeBlock } from "~/components/copyableComponents";
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
import SourcesIcon from "~/svg/Sources";

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
  sources: Source[] | null;
}

const SourcesListPage = ({ sources }: SourceListProps) => {
  const { colors } = useTheme();
  const currentEnvironment = useRecoilValue_TRANSITION_SUPPORT_UNSTABLE(
    currentEnvironmentState
  );

  const isDisabled = currentEnvironment?.state !== "enabled";
  const isLoading = sources === null;
  const isEmpty = !isLoading && sources.length === 0;

  return (
    <>
      <PageHeader>
        <PageHeading>Sources</PageHeading>
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
  const { colors } = useTheme();
  const navigate = useNavigate();

  return (
    <Table variant="borderless" data-testid="source-table" borderRadius="xl">
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
            onClick={() => navigate(`/sources/${s.name}`)}
            cursor="pointer"
            _hover={{
              bg: colors.semanticColors.background.secondary,
            }}
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
                {s.name}
              </Box>
            </Td>
            <Td>{s.status ? <StatusPill status={s.status} /> : "-"}</Td>
            <Td>{s.type}</Td>
            <Td>{s.size ?? "-"}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

interface StatusPillProps {
  status: SourceStatus;
}

const getBackgroundColor = (status: Source["status"]) => {
  switch (status) {
    case "created":
      return "#ECE5FF";
    case "starting":
      return "#ECE6FF";
    case "running":
      return "#DEF7E2";
    case "stalled":
      return "#F5E8CF";
    case "failed":
      return "#F5D4D9";
    case "dropped":
      return "#F7F7F8";
  }
};

const getTextColor = (status: Source["status"]) => {
  switch (status) {
    case "created":
      return "#1C1561";
    case "starting":
      return "#1C1561";
    case "running":
      return "#00471D";
    case "stalled":
      return "#8A5B01";
    case "failed":
      return "#B80F25";
    case "dropped":
      return "#736F7B";
  }
};

const StatusPill = ({ status }: StatusPillProps) => {
  let icon = null;
  if (status === "starting") {
    icon = <Spinner width="12px" height="12px" speed="0.75s" />;
  }
  if (status === "failed") {
    icon = <WarningIcon />;
  }
  return (
    <Box
      display="flex"
      alignItems="center"
      gap="4px"
      borderRadius="40px"
      paddingY="2px"
      paddingX="8px"
      textAlign="center"
      fontSize="xs"
      fontWeight="500"
      backgroundColor={getBackgroundColor(status)}
      color={getTextColor(status)}
      width="fit-content"
    >
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Box>
  );
};

export default SourcesListPage;
