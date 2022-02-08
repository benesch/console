import { HStack, Spinner, Table, Tbody, Th, Thead, Tr } from "@chakra-ui/react";
import React from "react";

import { Card } from "../components/cardComponents";
import { BaseLayout, PageBreadcrumbs, PageHeader } from "../layouts/BaseLayout";
import {
  EmptyList,
  ListPageHeaderContent,
} from "../layouts/listPageComponents";

const SinksListPage = () => {
  const isLoading = false;
  const isEmpty = true;
  return (
    <BaseLayout>
      <PageBreadcrumbs />
      <PageHeader>
        <HStack spacing={4} alignItems="center" justifyContent="flex-start">
          <ListPageHeaderContent title="Sinks" />
        </HStack>
      </PageHeader>
      {isLoading && <Spinner data-testid="loading-spinner" />}
      {isEmpty && <EmptyList title="sinks" />}
      {!isLoading && !isEmpty && <SinkTable />}
    </BaseLayout>
  );
};

const SinkTable = () => {
  return (
    <Card pt="2" px="0" pb="6">
      {
        <Table data-testid="cluster-table" borderRadius="xl">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Hostname</Th>
              <Th>Size</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody></Tbody>
        </Table>
      }
    </Card>
  );
};

export default SinksListPage;
