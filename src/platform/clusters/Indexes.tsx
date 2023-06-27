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
} from "@chakra-ui/react";
import { useFlags } from "launchdarkly-react-client-sdk";
import React from "react";
import { Route, useNavigate, useParams } from "react-router-dom";

import { Replica, useClusters } from "~/api/materialize/useClusters";
import { Index, useIndexes } from "~/api/materialized";
import { CodeBlock } from "~/components/copyableComponents";
import DatabaseFilter from "~/components/DatabaseFilter";
import ErrorBox from "~/components/ErrorBox";
import SchemaFilter from "~/components/SchemaFilter";
import SearchInput from "~/components/SearchInput";
import {
  EmptyListHeader,
  EmptyListHeaderContents,
  EmptyListWrapper,
  IconBox,
  SampleCodeBoxWrapper,
} from "~/layouts/listPageComponents";
import { SentryRoutes } from "~/sentry";
import ClustersIcon from "~/svg/Clusters";
import useSchemaObjectFilters from "~/useSchemaObjectFilters";

import { ClusterParams } from "./ClusterRoutes";
import { CLUSTERS_FETCH_ERROR_MESSAGE } from "./constants";

const DFViz = React.lazy(() => import("./Introspection"));

const createExample = `CREATE INDEX active_customers_geo_idx ON active_customers (geo_id);`;
const NAME_FILTER_QUERY_STRING_KEY = "indexName";

const Indexes = () => {
  const { id: clusterId } = useParams<ClusterParams>();

  const { databaseFilter, schemaFilter, nameFilter } = useSchemaObjectFilters(
    NAME_FILTER_QUERY_STRING_KEY
  );

  const useIndexesResponse = useIndexes({
    databaseId: databaseFilter.selected?.id,
    schemaId: schemaFilter.selected?.id,
    nameFilter: nameFilter.name,
    clusterId,
  });

  const {
    data: indexes,
    isInitiallyLoading: isIndexesLoading,
    isError: indexesError,
  } = useIndexesResponse;

  const {
    getClusterById,
    isInitiallyLoading: isClustersLoading,
    isError: clustersError,
  } = useClusters();

  const cluster = getClusterById(clusterId);

  const isLoading = isIndexesLoading || isClustersLoading;

  const isEmpty = indexes && indexes.length === 0;

  if (indexesError || clustersError) {
    return <ErrorBox message={CLUSTERS_FETCH_ERROR_MESSAGE} />;
  }
  if (isLoading) {
    return <Spinner data-testid="loading-spinner" />;
  }
  return (
    <>
      <HStack mb="6" alignItems="center" justifyContent="space-between">
        <Text textStyle="heading-sm">Indexes</Text>
        <HStack>
          <DatabaseFilter {...databaseFilter} />
          <SchemaFilter {...schemaFilter} />
          <SearchInput
            name="source"
            value={nameFilter.name}
            onChange={(e) => {
              nameFilter.setName(e.target.value);
            }}
          />
        </HStack>
      </HStack>
      {isEmpty ? (
        <EmptyListWrapper>
          <EmptyListHeader>
            <IconBox type="Missing">
              <ClustersIcon />
            </IconBox>
            <EmptyListHeaderContents
              title="This cluster has no indexes"
              helpText="Indexes assemble and maintain a query’s results in memory within a cluster, which provides future queries the data they need in a format they can immediately use."
            />
          </EmptyListHeader>
          <SampleCodeBoxWrapper docsUrl="https://materialize.com/docs/overview/key-concepts/#indexes">
            <CodeBlock
              lineNumbers
              title="Create an index"
              contents={createExample}
            >
              {createExample}
            </CodeBlock>
          </SampleCodeBoxWrapper>
        </EmptyListWrapper>
      ) : (
        <IndexTable
          indexes={indexes ?? []}
          replicas={cluster?.replicas ?? []}
        />
      )}
    </>
  );
};

interface IndexTableProps {
  indexes: Index[];
  replicas: Replica[];
}

const IndexTable = (props: IndexTableProps) => {
  const navigate = useNavigate();
  const flags = useFlags();
  const viz = flags["visualization-features"];
  return (
    <>
      <Table variant="standalone" data-testid="index-table" borderRadius="xl">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Object Name</Th>
            <Th>Type</Th>
            {viz && <Th>Visualization</Th>}
          </Tr>
        </Thead>
        <Tbody>
          {props.indexes.map((v) => (
            <Tr key={v.id}>
              <Td>{v.name}</Td>
              <Td>{v.relationName}</Td>
              <Td>{v.relationType}</Td>
              {viz && (
                <Td
                  onClick={() => navigate(`hierarchical-viz/${v.id}/${v.name}`)}
                  cursor="pointer"
                >
                  Visualize
                </Td>
              )}
            </Tr>
          ))}
        </Tbody>
      </Table>
      <SentryRoutes>
        <Route
          path="hierarchical-viz/:id/:indexName"
          element={<DFViz replicas={props.replicas} />}
        />
        <Route path="/" element={null} />
      </SentryRoutes>
    </>
  );
};

export default Indexes;
