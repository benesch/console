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
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";

import { Cluster, Replica } from "../../api/materialized";
import { Card, CardContent, CardHeader } from "../../components/cardComponents";
import TextLink from "../../components/TextLink";
import { PageBreadcrumbs, PageHeader } from "../../layouts/BaseLayout";
import {
  EmptyList,
  SQLSuggestion,
  SQLSuggestionBox,
} from "../../layouts/listPageComponents";
import { currentEnvironmentState } from "../../recoil/environments";
import ClustersIcon from "../../svg/Clusters";
import { semanticColors } from "../../theme/colors";
import { ClusterDetailParams } from "./clusterRouter";

const createReplicaSuggestion = {
  title: "Create a cluster replica",
  string: 'CREATE CLUSTER REPLICA <name> SIZE="<size>";',
};

const getReplicasSuggestions = (name: string): SQLSuggestion[] => [
  {
    title: "View cluster replicas",
    string: "SHOW clusters;",
  },
  {
    title: "View replicas of a specific cluster",
    string: `SHOW CLUSTER REPLICAS\n
WHERE CLUSTER="${name};"`,
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
  const currentEnvironment = useRecoilValue(currentEnvironmentState);
  const { clusterName } = useParams<ClusterDetailParams>();
  const grayText = useColorModeValue(
    semanticColors.grayText.light,
    semanticColors.grayText.dark
  );
  const replicas: Replica[] | null = React.useMemo(() => {
    if (!cluster) {
      return null;
    } else {
      return cluster.replicas || [];
    }
  }, [cluster]);

  const isDisabled = currentEnvironment.state !== "enabled";
  const isLoading = !cluster;
  const isEmpty = !isLoading && (!replicas || replicas.length === 0);

  return (
    <>
      <PageHeader>
        <PageBreadcrumbs crumbs={[clusterName, "Replicas"]} />
      </PageHeader>
      {isLoading && !isEmpty && !isDisabled && (
        <Spinner data-testid="loading-spinner" />
      )}
      {isEmpty && !isDisabled && (
        <EmptyList
          title="This cluster has no replicas"
          heading="Without replicas, your cluster cannot compute dataflows."
          icon={<ClustersIcon />}
          codeBlockTitle="Create a cluster replica"
          codeBlockContents={`CREATE CLUSTER REPLICA
  ${clusterName}.<replica_name>
  SIZE = “xsmall”;`}
          codeBlockChildren={`CREATE CLUSTER <cluster_name>
  REPLICAS (
    <replica_name> (SIZE = “xsmall”)
);`}
          docsUrl="//materialize.com/docs/sql/create-cluster-replica/"
          type="Missing"
        />
      )}
      {!isLoading && !isEmpty && !isDisabled && (
        <HStack spacing={6} alignItems="flex-start">
          <ReplicaTable replicas={replicas as Replica[]} />
          <Card flex={0} minW="384px" maxW="384px">
            <CardHeader>Interacting with cluster replicas</CardHeader>
            <CardContent pb={8}>
              <VStack spacing={4} alignItems="stretch" fontSize="sm">
                <Text color={grayText}>
                  Cluster replicas are where Materialize creates and maintains
                  dataflows.
                </Text>
                <Text color={grayText}>
                  Having trouble?{" "}
                  <TextLink href="https://materialize.com/docs/overview/key-concepts/#clusters">
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
  return (
    <Card pt="2" px="0" pb="6">
      <Table data-testid="cluster-table" borderRadius="xl">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Size</Th>
          </Tr>
        </Thead>
        <Tbody>
          {props.replicas.map((r) => (
            <Tr key={r.replica}>
              <Td>{r.replica}</Td>
              <Td>{r.size}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Card>
  );
};

export default ClusterDetailPage;
