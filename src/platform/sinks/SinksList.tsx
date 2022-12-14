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
  useInterval,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { useRecoilValue_TRANSITION_SUPPORT_UNSTABLE } from "recoil";

import { Sink, useDDL, useSinks } from "~/api/materialized";
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
import SinksIcon from "~/svg/Sinks";
import { isPollingDisabled } from "~/util";

const SINK_CREATE_SQL = `CREATE SINK <sink_name>
  FROM <view_name>
  INTO <item_name>
  FORMAT <format>
  ENVELOPE <envelope>
  WITH (SIZE = 'xsmall');`;

const sourcesSuggestions: SQLSuggestion[] = [
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
    string: "DROP SINK <source_name>;",
  },
];

const SinksListPage = () => {
  const { colors } = useTheme();
  const currentEnvironment = useRecoilValue_TRANSITION_SUPPORT_UNSTABLE(
    currentEnvironmentState
  );
  const { sinks, refetch } = useSinks();
  useInterval(refetch, isPollingDisabled() ? null : 5000);

  const isDisabled = currentEnvironment?.state !== "enabled";
  const isLoading = sinks === null;
  const isEmpty = !isLoading && sinks.length === 0;

  return (
    <>
      <PageHeader>
        <PageHeading>Sinks</PageHeading>
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

interface SinkTableProps {
  sinks: Sink[];
}

const SinkTable = (props: SinkTableProps) => {
  const { colors } = useTheme();
  const [activeSinkName, setActiveSinkName] = React.useState("");
  const { ddl, refetch } = useDDL("SINK", activeSinkName);

  // if the active sink name changes, refetch data
  React.useEffect(() => {
    refetch();
  }, [refetch, activeSinkName]);

  return (
    <>
      <Table variant="borderless" data-testid="sink-table" borderRadius="xl">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Type</Th>
            <Th>Size</Th>
          </Tr>
        </Thead>
        <Tbody>
          {props.sinks.map((s) => (
            <Tr
              key={s.id}
              onClick={() => setActiveSinkName(s.name)}
              cursor="pointer"
              _hover={{
                bg: colors.semanticColors.background.secondary,
              }}
            >
              <Td
                borderBottomWidth="1px"
                borderBottomColor={colors.semanticColors.border.primary}
              >
                {s.name}
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
      <Modal
        isOpen={!!activeSinkName && ddl}
        onClose={() => setActiveSinkName("")}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{`DDL statement for sink "${activeSinkName}"`}</ModalHeader>
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

export default SinksListPage;
