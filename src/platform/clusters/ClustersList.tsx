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
  useTheme,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue_TRANSITION_SUPPORT_UNSTABLE } from "recoil";

import { Cluster, ClusterResponse } from "~/api/materialized";
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
import { MaterializeTheme } from "~/theme";

const createClusterSuggestion = {
  title: "Create a cluster",
  string: `CREATE CLUSTER <cluster_name> 
  REPLICAS (
    <name> (SIZE = '2xsmall')
  );`,
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
  clusterResponse: ClusterResponse;
};

const ClustersListPage = ({ clusterResponse }: Props) => {
  const { colors } = useTheme<MaterializeTheme>();

  const currentEnvironment = useRecoilValue_TRANSITION_SUPPORT_UNSTABLE(
    currentEnvironmentState
  );

  const { data: clusters } = clusterResponse;
  const isLoading = clusters === null;
  const isDisabled = currentEnvironment?.state !== "enabled";
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
    <replica_name> (SIZE = 'xsmall')
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
                <Text color={colors.semanticColors.foreground.secondary}>
                  Clusters are logical components that let you express resource
                  isolation for all dataflow-powered objects.
                </Text>
                <Text color={colors.semanticColors.foreground.secondary}>
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

  const { colors } = useTheme<MaterializeTheme>();

  return (
    <Table variant="borderless" data-testid="cluster-table" borderRadius="xl">
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Replicas</Th>
        </Tr>
      </Thead>
      <Tbody>
        {props.clusters.map((c) => (
          <Tr
            key={c.id}
            onClick={() => navigate(`/clusters/${c.name}`)}
            cursor="pointer"
            _hover={{
              bg: colors.semanticColors.background.secondary,
            }}
          >
            <Td
              borderBottomWidth="1px"
              borderBottomColor={colors.semanticColors.border.primary}
            >
              {c.name}
            </Td>
            <Td
              borderBottomWidth="1px"
              borderBottomColor={colors.semanticColors.border.primary}
            >
              {c.replicas.length}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default ClustersListPage;
