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
  useDisclosure,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { useParams } from "react-router-dom";

import { useSegment } from "~/analytics/segment";
import useMaxReplicasPerCluster from "~/api/materialize/useMaxReplicasPerCluster";
import {
  ClusterReplicaWithUtilizaton,
  useClusterReplicasWithUtilization,
} from "~/api/materialized";
import { Card, CardContent, CardHeader } from "~/components/cardComponents";
import { CodeBlock } from "~/components/copyableComponents";
import ErrorBox from "~/components/ErrorBox";
import TextLink from "~/components/TextLink";
import { PageHeading } from "~/layouts/BaseLayout";
import {
  EmptyListHeader,
  EmptyListHeaderContents,
  EmptyListWrapper,
  IconBox,
  SampleCodeBoxWrapper,
  SQLSuggestion,
  SQLSuggestionBox,
} from "~/layouts/listPageComponents";
import { ClusterParams } from "~/platform/clusters/ClusterRoutes";
import ClustersIcon from "~/svg/Clusters";
import { MaterializeTheme } from "~/theme";
import useForegroundInterval from "~/useForegroundInterval";
import { assert } from "~/util";

import { CLUSTERS_FETCH_ERROR_MESSAGE } from "./constants";
import NewReplicaModal from "./NewReplicaModal";

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

const ClusterReplicasPage = () => {
  const { track } = useSegment();
  const { colors } = useTheme<MaterializeTheme>();

  const { id: clusterId, clusterName } = useParams<ClusterParams>();
  const {
    isInitiallyLoading,
    data: replicas,
    refetch,
    isError,
  } = useClusterReplicasWithUtilization(clusterId);
  useForegroundInterval(refetch);

  const { data: maxReplicas } = useMaxReplicasPerCluster();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleCreateReplica = () => {
    onClose();
    refetch();
  };

  const isEmpty = replicas && replicas.length === 0;
  assert(clusterName);

  return (
    <>
      {isError ? (
        <ErrorBox message={CLUSTERS_FETCH_ERROR_MESSAGE} />
      ) : isInitiallyLoading ? (
        <Spinner data-testid="loading-spinner" />
      ) : isEmpty ? (
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
      ) : (
        <>
          <HStack mb="6" alignItems="flex-start" justifyContent="space-between">
            <PageHeading>Replicas</PageHeading>
            {replicas && maxReplicas && replicas.length < maxReplicas && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onOpen();
                  track("New Replica Clicked");
                }}
              >
                New Replica
              </Button>
            )}
          </HStack>
          <HStack spacing={6} alignItems="flex-start">
            <ReplicaTable replicas={replicas ?? []} />
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
                  {getReplicasSuggestions(clusterName).map((suggestion) => (
                    <SQLSuggestionBox
                      key={`suggestion-${suggestion.title}`}
                      {...suggestion}
                    />
                  ))}
                </VStack>
              </CardContent>
            </Card>
          </HStack>
          <NewReplicaModal
            isOpen={isOpen}
            onClose={onClose}
            clusterName={clusterName}
            onSubmit={handleCreateReplica}
          />
        </>
      )}
    </>
  );
};

interface ReplicaTableProps {
  replicas: ClusterReplicaWithUtilizaton[];
}

const ReplicaTable = (props: ReplicaTableProps) => {
  const { colors } = useTheme<MaterializeTheme>();
  return (
    <Table variant="standalone" data-testid="cluster-table" borderRadius="xl">
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Size</Th>
          <Th>CPU</Th>
          <Th>Memory</Th>
        </Tr>
      </Thead>
      <Tbody>
        {props.replicas.map((r) => (
          <Tr key={r.name}>
            <Td>{r.name}</Td>
            <Td>{r.size}</Td>
            <Td>
              {r.cpuPercent && (
                <>
                  {r.cpuPercent.toFixed(1)}
                  <Text
                    as="span"
                    color={colors.semanticColors.foreground.secondary}
                  >
                    %
                  </Text>
                </>
              )}
            </Td>
            <Td>
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

export default ClusterReplicasPage;
