import {
  Box,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useInterval,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { useRecoilValue_TRANSITION_SUPPORT_UNSTABLE } from "recoil";

import { Source, useDDL, useSources } from "~/api/materialized";
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
import { semanticColors } from "~/theme/colors";
import { isPollingDisabled } from "~/util";

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

const SourcesListPage = () => {
  const currentEnvironment = useRecoilValue_TRANSITION_SUPPORT_UNSTABLE(
    currentEnvironmentState
  );
  const { sources, refetch } = useSources();
  useInterval(refetch, isPollingDisabled() ? null : 5000);
  const grayText = useColorModeValue(
    semanticColors.grayText.light,
    semanticColors.grayText.dark
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
                <Text color={grayText}>
                  A source describes an external system you want Materialize to
                  read data from.
                </Text>
                <Text color={grayText}>
                  Having trouble?{" "}
                  <TextLink href="https://materialize.com/docs/overview/key-concepts/#sources">
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
  const [activeSourceName, setActiveSourceName] = React.useState("");
  // automatically refetches if activeSourceName changes
  const { ddl } = useDDL("SOURCE", activeSourceName);
  const hoverColor = useColorModeValue("gray.50", "gray.900");
  return (
    <>
      <Card pt="2" px="0" pb="6" minWidth="fit-content">
        <Table data-testid="source-table" borderRadius="xl">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Status</Th>
              <Th>Type</Th>
              <Th>Size</Th>
            </Tr>
          </Thead>
          <Tbody>
            {props.sources.map((s) => (
              <Tr
                key={s.id}
                onClick={() => setActiveSourceName(s.name)}
                cursor="pointer"
                _hover={{
                  bg: hoverColor,
                }}
              >
                <Td>{s.name}</Td>
                <Td>{s.status ?? "-"}</Td>
                <Td>{s.type}</Td>
                <Td>{s.size ?? "-"}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>
      <Modal
        isOpen={!!activeSourceName && ddl}
        onClose={() => setActiveSourceName("")}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{`DDL statement for source "${activeSourceName}"`}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pt="3" pb="6">
            <CodeBlock title="SQL" contents={ddl}>
              {ddl}
            </CodeBlock>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SourcesListPage;
