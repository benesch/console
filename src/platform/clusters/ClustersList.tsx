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
  useInterval,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { Cluster, useClusters } from "../../api/materialized";
import { Card, CardContent, CardHeader } from "../../components/cardComponents";
import TextLink from "../../components/TextLink";
import {
  PageBreadcrumbs,
  PageHeader,
  PageHeading,
} from "../../layouts/BaseLayout";
import {
  EmptyList,
  SQLSuggestion,
  SQLSuggestionBox,
} from "../../layouts/listPageComponents";
import { currentEnvironmentState } from "../../recoil/environments";
import ClustersIcon from "../../svg/Clusters";
import { semanticColors } from "../../theme/colors";

const createClusterSuggestion = {
  title: "Create an empty cluster",
  string: "CREATE cluster <cluster_name> REPLICAS ();",
};

const clustersSuggestions: SQLSuggestion[] = [
  {
    title: "View your clusters",
    string: "SHOW clusters;",
  },
  createClusterSuggestion,
  {
    title: "Switch clusters",
    string: "SET CLUSTER = <cluster_name>;",
  },
  {
    title: "Drop a cluster",
    string: "DROP cluster <cluster_name>;",
  },
];

const ClustersListPage = () => {
  const currentEnvironment = useRecoilValue(currentEnvironmentState);
  const { clusters, refetch } = useClusters();
  useInterval(refetch, 5000);
  const grayText = useColorModeValue(
    semanticColors.grayText.light,
    semanticColors.grayText.dark
  );

  const isDisabled = currentEnvironment.state !== "enabled";
  const isLoading = clusters === null;
  const isEmpty = !isLoading && clusters.length === 0;

  return (
    <>
      <PageHeader>
        <PageBreadcrumbs />
        <PageHeading>Clusters</PageHeading>
      </PageHeader>
      {isLoading && !isEmpty && !isDisabled && (
        <Spinner data-testid="loading-spinner" />
      )}
      {isEmpty && !isDisabled && (
        <EmptyList
          title="clusters"
          heading="Create a cluster and one or more replicas to enable dataflows."
          icon={<ClustersIcon />}
          codeBlockTitle="Create cluster"
          codeBlockContents={`CREATE CLUSTER <cluster_name>
  REPLICAS (
    <replica_name> (SIZE = “xsmall”)
);`}
          codeBlockChildren={`CREATE CLUSTER <cluster_name>
  REPLICAS (
    <replica_name> (SIZE = “xsmall”)
);`}
        />
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
                  <TextLink href="https://materialize.com/docs/overview/key-concepts/#clusters">
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
  return (
    <Card pt="2" px="0" pb="6">
      <Table data-testid="cluster-table" borderRadius="xl">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th># of Replicas</Th>
          </Tr>
        </Thead>
        <Tbody>
          {props.clusters.map((c) => (
            <Tr key={c.id}>
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
