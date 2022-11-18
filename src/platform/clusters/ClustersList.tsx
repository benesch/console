import {
  HStack,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue_TRANSITION_SUPPORT_UNSTABLE } from "recoil";

import { Cluster } from "~/api/materialized";
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
import ClustersIcon from "~/svg/Clusters";
import { semanticColors } from "~/theme/colors";

const createClusterSuggestion = {
  title: "Create a cluster",
  string:
    "CREATE CLUSTER <cluster_name> REPLICAS (<replica_name> (SIZE = '2xsmall'));",
};

const clustersSuggestions: SQLSuggestion[] = [
  {
    title: "View your clusters",
    string: "SHOW CLUSTERS;",
  },
  createClusterSuggestion,
  {
    title: "Switch clusters",
    string: "SET CLUSTER = <cluster_name>;",
  },
  {
    title: "Drop a cluster",
    string: "DROP CLUSTER <cluster_name>;",
  },
];

type Props = {
  clusters: Cluster[] | null;
};

const ClustersListPage = ({ clusters }: Props) => {
  const currentEnvironment = useRecoilValue_TRANSITION_SUPPORT_UNSTABLE(
    currentEnvironmentState
  );
  const grayText = useColorModeValue(
    semanticColors.grayText.light,
    semanticColors.grayText.dark
  );

  const isDisabled = currentEnvironment?.state !== "enabled";
  const isLoading = clusters === null;
  const isEmpty = !isLoading && clusters.length === 0;

  return (
    <>
      <PageHeader>
        <PageHeading>Clusters</PageHeading>
      </PageHeader>
      {isLoading && !isEmpty && !isDisabled && (
        <Spinner data-testid="loading-spinner" />
      )}
      {isEmpty && !isDisabled && (
        <EmptyListWrapper>
          <EmptyListHeader>
            <IconBox type="Empty">
              <ClustersIcon />
            </IconBox>
            <EmptyListHeaderContents
              title="No available clusters"
              helpText="Create a cluster and one or more replicas to enable dataflows."
            />
          </EmptyListHeader>
          <SampleCodeBoxWrapper docsUrl="//materialize.com/docs/sql/create-cluster/">
            <CodeBlock
              title={createClusterSuggestion.title}
              contents={createClusterSuggestion.string}
              lineNumbers
            >
              {`CREATE CLUSTER <cluster_name>
  REPLICAS (
    <replica_name> (SIZE = “xsmall”)
);`}
            </CodeBlock>
          </SampleCodeBoxWrapper>
        </EmptyListWrapper>
      )}
      {!isLoading && !isEmpty && !isDisabled && (
        <HStack spacing={6} alignItems="flex-start">
          <ClusterTable clusters={clusters} />
          <Card flex={0} minW="384px" maxW="384px">
            <CardHeader>Interacting with clusters</CardHeader>
            <CardContent pb={8}>
              <VStack spacing={4} alignItems="stretch" fontSize="sm">
                <Text color={grayText}>
                  Clusters are logical components that let you express resource
                  isolation for all dataflow-powered objects.
                </Text>
                <Text color={grayText}>
                  Having trouble?{" "}
                  <TextLink
                    href="https://materialize.com/docs/overview/key-concepts/#clusters"
                    target="_blank"
                  >
                    View the documentation.
                  </TextLink>
                </Text>
                {clustersSuggestions.map((suggestion) => (
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

interface ClusterTableProps {
  clusters: Cluster[];
}

const ClusterTable = (props: ClusterTableProps) => {
  const navigate = useNavigate();
  const hoverColor = useColorModeValue("gray.50", "gray.900");

  return (
    <Card pt="2" px="0" pb="6" minWidth="fit-content">
      <Table data-testid="cluster-table" borderRadius="xl">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th># of Replicas</Th>
          </Tr>
        </Thead>
        <Tbody>
          {props.clusters.map((c) => (
            <Tr
              key={c.id}
              onClick={() => navigate(`/clusters/${c.name}`)}
              cursor="pointer"
              _hover={{
                bg: hoverColor,
              }}
            >
              <Td>{c.name}</Td>
              <Td>{c.replicas ? c.replicas.length : <Spinner size="sm" />}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Card>
  );
};

export default ClustersListPage;
