import {
  HStack,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useInterval,
} from "@chakra-ui/react";
import React from "react";

import { Cluster, useClusters } from "../../api/materialized";
import { Card } from "../../components/cardComponents";
import {
  BaseLayout,
  PageBreadcrumbs,
  PageHeader,
} from "../../layouts/BaseLayout";
import EnvironmentSelectField from "../../layouts/EnvironmentSelect";
import {
  EmptyList,
  ListPageHeaderContent,
} from "../../layouts/listPageComponents";

const ClustersListPage = () => {
  const { clusters, refetch } = useClusters();
  useInterval(refetch, 5000);
  const isLoading = clusters === null;
  const isEmpty = !isLoading && clusters.length === 0;
  return (
    <BaseLayout>
      <PageBreadcrumbs />
      <PageHeader>
        <HStack spacing={4} alignItems="center" justifyContent="flex-start">
          <ListPageHeaderContent title="Clusters">
            <EnvironmentSelectField />
          </ListPageHeaderContent>
        </HStack>
      </PageHeader>
      {isLoading && <Spinner data-testid="loading-spinner" />}
      {isEmpty && <EmptyList title="clusters" />}
      {!isLoading && !isEmpty && <ClusterTable clusters={clusters} />}
    </BaseLayout>
  );
};

interface ClusterTableProps {
  clusters: Cluster[];
}

const ClusterTable = (props: ClusterTableProps) => {
  return (
    <Card pt="2" px="0" pb="6">
      {
        <Table data-testid="cluster-table" borderRadius="xl">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Name</Th>
            </Tr>
          </Thead>
          <Tbody>
            {props.clusters.map((c) => (
              <Tr key={c.id}>
                <Td>{c.id}</Td>
                <Td>{c.name}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      }
    </Card>
  );
};

export default ClustersListPage;
