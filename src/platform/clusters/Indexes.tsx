import { Spinner, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { useFlags } from "launchdarkly-react-client-sdk";
import React from "react";
import { Route, useNavigate } from "react-router-dom";

import { Cluster, Index, Replica, useIndexes } from "~/api/materialized";
import { CodeBlock } from "~/components/copyableComponents";
import {
  EmptyListHeader,
  EmptyListHeaderContents,
  EmptyListWrapper,
  IconBox,
  SampleCodeBoxWrapper,
} from "~/layouts/listPageComponents";
import { SentryRoutes } from "~/sentry";
import ClustersIcon from "~/svg/Clusters";

const DFViz = React.lazy(() => import("./Introspection"));

type IndexesProps = {
  cluster?: Cluster;
};

const createExample = `CREATE INDEX active_customers_geo_idx ON active_customers (geo_id);`;

const Indexes = ({ cluster }: IndexesProps) => {
  const { data: indexes } = useIndexes(cluster?.id);
  const isLoading = !indexes;
  const isEmpty = !isLoading && (!indexes || indexes.length === 0);

  return (
    <>
      {isLoading && !isEmpty && <Spinner data-testid="loading-spinner" />}
      {isEmpty && (
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
      )}
      {!isLoading && !isEmpty && (
        <IndexTable indexes={indexes} replicas={cluster?.replicas || []} />
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
        <Route path="/" />
      </SentryRoutes>
    </>
  );
};

export default Indexes;
