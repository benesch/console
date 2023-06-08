import {
  HStack,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import React from "react";
import { useParams } from "react-router-dom";

import { MaterializedView, useMaterializedViews } from "~/api/materialized";
import { CodeBlock } from "~/components/copyableComponents";
import DatabaseFilter from "~/components/DatabaseFilter";
import ErrorBox from "~/components/ErrorBox";
import SchemaFilter from "~/components/SchemaFilter";
import { PageHeading } from "~/layouts/BaseLayout";
import {
  EmptyListHeader,
  EmptyListHeaderContents,
  EmptyListWrapper,
  IconBox,
  SampleCodeBoxWrapper,
} from "~/layouts/listPageComponents";
import ClustersIcon from "~/svg/Clusters";
import useSchemaObjectFilters from "~/useSchemaObjectFilters";

import { ClusterParams } from "./ClusterRoutes";
import { CLUSTERS_FETCH_ERROR_MESSAGE } from "./constants";

const createExample = `CREATE MATERIALIZED VIEW winning_bids AS
  SELECT auction_id,
         bid_id,
         item,
         amount
  FROM highest_bid_per_auction
  WHERE end_time < mz_now();`;

const NAME_FILTER_QUERY_STRING_KEY = "viewsName";

const MaterializedViews = () => {
  const { id: clusterId } = useParams<ClusterParams>();

  const { databaseFilter, schemaFilter, nameFilter } = useSchemaObjectFilters(
    NAME_FILTER_QUERY_STRING_KEY
  );

  const materializedViewsResponse = useMaterializedViews({
    databaseId: databaseFilter.selected?.id,
    schemaId: schemaFilter.selected?.id,
    nameFilter: nameFilter.name,
    clusterId,
  });

  const {
    data: materializedViews,
    isInitiallyLoading,
    isError,
  } = materializedViewsResponse;

  const isEmpty = materializedViews && materializedViews.length === 0;

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
              title="This cluster has no materialized views"
              helpText="Materialized views are one of the most powerful features of materalize."
            />
          </EmptyListHeader>
          <SampleCodeBoxWrapper docsUrl="//materialize.com/docs/sql/create-materialized-view/">
            <CodeBlock
              lineNumbers
              title="Create a materialized view"
              contents={createExample}
            >
              {createExample}
            </CodeBlock>
          </SampleCodeBoxWrapper>
        </EmptyListWrapper>
      ) : (
        <>
          <HStack mb="6" alignItems="flex-start" justifyContent="space-between">
            <PageHeading>Materialized Views</PageHeading>
            <HStack>
              <DatabaseFilter {...databaseFilter} />
              <SchemaFilter {...schemaFilter} />
            </HStack>
          </HStack>
          <MaterializedViewTable materializedViews={materializedViews ?? []} />
        </>
      )}
    </>
  );
};

interface MaterializedViewTableProps {
  materializedViews: MaterializedView[];
}

const MaterializedViewTable = (props: MaterializedViewTableProps) => {
  return (
    <Table
      variant="standalone"
      data-testid="materialized-view-table"
      borderRadius="xl"
    >
      <Thead>
        <Tr>
          <Th>Name</Th>
        </Tr>
      </Thead>
      <Tbody>
        {props.materializedViews.map((v) => (
          <Tr key={v.name}>
            <Td>{v.name}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default MaterializedViews;
