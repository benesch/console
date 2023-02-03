import {
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useTheme,
} from "@chakra-ui/react";
import React from "react";

import { Cluster, Index, useIndexes } from "~/api/materialized";
import { CodeBlock } from "~/components/copyableComponents";
import {
  EmptyListHeader,
  EmptyListHeaderContents,
  EmptyListWrapper,
  IconBox,
  SampleCodeBoxWrapper,
} from "~/layouts/listPageComponents";
import ClustersIcon from "~/svg/Clusters";
import { MaterializeTheme } from "~/theme";

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
      {!isLoading && !isEmpty && <IndexTable indexes={indexes} />}
    </>
  );
};

interface IndexTableProps {
  indexes: Index[];
}

const IndexTable = (props: IndexTableProps) => {
  const { colors } = useTheme<MaterializeTheme>();
  return (
    <Table variant="standalone" data-testid="index-table" borderRadius="xl">
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Object Name</Th>
          <Th>Type</Th>
        </Tr>
      </Thead>
      <Tbody>
        {props.indexes.map((v) => (
          <Tr
            key={v.id}
            cursor="pointer"
            _hover={{
              bg: colors.semanticColors.background.secondary,
            }}
          >
            <Td
              borderBottomWidth="1px"
              borderBottomColor={colors.semanticColors.border.primary}
            >
              {v.name}
            </Td>
            <Td
              borderBottomWidth="1px"
              borderBottomColor={colors.semanticColors.border.primary}
            >
              {v.relationName}
            </Td>
            <Td
              borderBottomWidth="1px"
              borderBottomColor={colors.semanticColors.border.primary}
            >
              {v.relationType}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default Indexes;
