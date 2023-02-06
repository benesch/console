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
import { useParams } from "react-router-dom";
import { useRecoilValue_TRANSITION_SUPPORT_UNSTABLE } from "recoil";

import { Cluster, Replica } from "~/api/materialized";
import { Card, CardContent, CardHeader } from "~/components/cardComponents";
import { CodeBlock } from "~/components/copyableComponents";
import TextLink from "~/components/TextLink";
import {
  EmptyListHeader,
  EmptyListHeaderContents,
  EmptyListWrapper,
  IconBox,
  SampleCodeBoxWrapper,
  SQLSuggestion,
  SQLSuggestionBox,
} from "~/layouts/listPageComponents";
import { ClusterDetailParams } from "~/platform/clusters/ClusterRoutes";
import { currentEnvironmentState } from "~/recoil/environments";
import ClustersIcon from "~/svg/Clusters";
import { MaterializeTheme } from "~/theme";

const createReplicaSuggestion = {
  title: "Create a cluster replica",
  string: 'CREATE CLUSTER REPLICA <name> SIZE="<size>";',
};

const getReplicasSuggestions = (name: string): SQLSuggestion[] => [
  {
    title: "View cluster replicas",
    string: "SHOW CLUSTER REPLICAS;",
  },
  {
    title: "View replicas of a specific cluster",
    string: `SHOW CLUSTER REPLICAS\nWHERE CLUSTER='${name}';`,
  },
  createReplicaSuggestion,
  {
    title: "Drop a cluster replica",
    string: `DROP CLUSTER REPLICA ${name};`,
  },
];

type Props = {
  cluster?: Cluster;
};

const ClusterDetailPage = ({ cluster }: Props) => {
  const { colors } = useTheme<MaterializeTheme>();
  const currentEnvironment = useRecoilValue_TRANSITION_SUPPORT_UNSTABLE(
    currentEnvironmentState
  );
  const { clusterName } = useParams<ClusterDetailParams>();
  const replicas = cluster?.replicas;

  const isDisabled =
    !currentEnvironmentState || currentEnvironment?.state !== "enabled";
  const isLoading = !cluster;
  const isEmpty = !isLoading && (!replicas || replicas.length === 0);

  return (
    <>
      {isLoading && !isEmpty && !isDisabled && (
        <Spinner data-testid="loading-spinner" />
      )}
      {isEmpty && !isDisabled && (
        <EmptyListWrapper>
          <EmptyListHeader>
            <IconBox type="Missing">
              <ClustersIcon />
            </IconBox>
            <EmptyListHeaderContents
              title="This cluster has no replicas"
              helpText="Without replicas, your cluster cannot compute dataflows."
            />
          </EmptyListHeader>
          <SampleCodeBoxWrapper docsUrl="//materialize.com/docs/sql/create-cluster-replica/">
            <CodeBlock
              title="Create a cluster replica"
              contents={`CREATE CLUSTER REPLICA
  ${clusterName}.<replica_name>
  SIZE = 'xsmall';`}
              lineNumbers
            >
              {`CREATE CLUSTER REPLICA
  ${clusterName}.<replica_name>
  SIZE = 'xsmall';`}
            </CodeBlock>
          </SampleCodeBoxWrapper>
        </EmptyListWrapper>
      )}
      {!isLoading && !isEmpty && !isDisabled && (
        <HStack spacing={6} alignItems="flex-start">
          <ReplicaTable replicas={replicas as Replica[]} />
          <Card flex={0} minW="384px" maxW="384px">
            <CardHeader>Interacting with cluster replicas</CardHeader>
            <CardContent pb={8}>
              <VStack spacing={4} alignItems="stretch" fontSize="sm">
                <Text color={colors.semanticColors.foreground.secondary}>
                  Cluster replicas are where Materialize creates and maintains
                  dataflows.
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
                {getReplicasSuggestions(cluster.name).map((suggestion) => (
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

interface ReplicaTableProps {
  replicas: Replica[];
}

const ReplicaTable = (props: ReplicaTableProps) => {
  const { colors } = useTheme<MaterializeTheme>();
  return (
    <Table variant="standalone" data-testid="cluster-table" borderRadius="xl">
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Size</Th>
          <Th>Memory</Th>
        </Tr>
      </Thead>
      <Tbody>
        {props.replicas.map((r) => (
          <Tr
            key={r.name}
            cursor="pointer"
            _hover={{
              bg: colors.semanticColors.background.secondary,
            }}
          >
            <Td
              borderBottomWidth="1px"
              borderBottomColor={colors.semanticColors.border.primary}
            >
              {r.name}
            </Td>
            <Td
              borderBottomWidth="1px"
              borderBottomColor={colors.semanticColors.border.primary}
            >
              {r.size}
            </Td>
            <Td
              borderBottomWidth="1px"
              borderBottomColor={colors.semanticColors.border.primary}
            >
              {r.memoryPercent && (
                <>
                  {r.memoryPercent.toFixed(1)}
                  <Text
                    as="span"
                    color={colors.semanticColors.foreground.secondary}
                  >
                    %
                  </Text>
                </>
              )}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default ClusterDetailPage;
