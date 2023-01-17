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

import { Source } from "~/api/materialized";
import { Card, CardContent, CardHeader } from "~/components/cardComponents";
import { CodeBlock } from "~/components/copyableComponents";
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
import SourcesIcon from "~/svg/Sources";
import { MaterializeTheme } from "~/theme";

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
  const { colors } = useTheme<MaterializeTheme>();
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
  const { colors } = useTheme<MaterializeTheme>();
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
            key={s.oid}
            onClick={() => navigate(`/sources/${s.name}/errors`)}
            cursor="pointer"
            _hover={{
              bg: colors.semanticColors.background.secondary,
            }}
          >
            <Td
              borderBottomWidth="1px"
              borderBottomColor={colors.semanticColors.border.primary}
            >
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
            <Td
              borderBottomWidth="1px"
              borderBottomColor={colors.semanticColors.border.primary}
            >
              {s.status ? <StatusPill status={s.status} /> : "-"}
            </Td>
            <Td
              borderBottomWidth="1px"
              borderBottomColor={colors.semanticColors.border.primary}
            >
              {s.type}
            </Td>
            <Td
              borderBottomWidth="1px"
              borderBottomColor={colors.semanticColors.border.primary}
            >
              {s.size || "-"}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default SourcesListPage;
