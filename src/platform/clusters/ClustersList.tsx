import {
  Button,
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
import { useFlags } from "launchdarkly-react-client-sdk";
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { Cluster, useClusters } from "~/api/materialize/useClusters";
import { Card, CardContent, CardHeader } from "~/components/cardComponents";
import { CodeBlock } from "~/components/copyableComponents";
import ErrorBox from "~/components/ErrorBox";
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
import ClustersIcon from "~/svg/Clusters";
import { MaterializeTheme } from "~/theme";

import { relativeClusterPath } from "./ClusterRoutes";
import { CLUSTERS_FETCH_ERROR_MESSAGE } from "./constants";

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

const ClustersListPage = () => {
  const { colors } = useTheme<MaterializeTheme>();
  const flags = useFlags();
  const { data: clusters, isInitiallyLoading, isError } = useClusters();

  const isEmpty = clusters !== null && clusters.length === 0;

  return (
    <>
      <PageHeader>
        <PageHeading>Clusters</PageHeading>
        {flags["source-creation-41"] && (
          <Button variant="primary" size="sm" as={NavLink} to="new">
            New cluster
          </Button>
        )}
      </PageHeader>
      {isError ? (
        <ErrorBox message={CLUSTERS_FETCH_ERROR_MESSAGE} />
      ) : isInitiallyLoading ? (
        <Spinner data-testid="loading-spinner" />
      ) : isEmpty ? (
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
      ) : (
        <HStack spacing={6} alignItems="flex-start">
          <ClusterTable clusters={clusters ?? []} />
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

  return (
    <Table variant="standalone" data-testid="cluster-table" borderRadius="xl">
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
            onClick={() => navigate(relativeClusterPath(c))}
            cursor="pointer"
          >
            <Td>{c.name}</Td>
            <Td>{c.replicas.length}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default ClustersListPage;
