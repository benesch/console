import { HStack, Spinner, Table, Tbody, Th, Thead, Tr } from "@chakra-ui/react";
import React from "react";

import { Card } from "../components/cardComponents";
import { BaseLayout, PageBreadcrumbs, PageHeader } from "../layouts/BaseLayout";
import {
  EmptyList,
  ListPageHeaderContent,
} from "../layouts/listPageComponents";

const SourcesListPage = () => {
  const isLoading = false;
  const isEmpty = true;
  return (
    <BaseLayout>
      <PageBreadcrumbs />
      <PageHeader>
        <HStack spacing={4} alignItems="center" justifyContent="flex-start">
          <ListPageHeaderContent title="Sources" />
        </HStack>
      </PageHeader>
      {isLoading && <Spinner data-testid="loading-spinner" />}
      {isEmpty && <EmptyList title="sources" />}
      {!isLoading && !isEmpty && <SourceTable />}
    </BaseLayout>
  );
};

const SourceTable = () => {
  return (
    <Card pt="2" px="0" pb="6">
      {
        <Table data-testid="source-table" borderRadius="xl">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody></Tbody>
        </Table>
      }
    </Card>
  );
};

export default SourcesListPage;
