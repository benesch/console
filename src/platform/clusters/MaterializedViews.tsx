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

import {
  Cluster,
  MaterializedView,
  useMaterializedViews,
} from "~/api/materialized";
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

type MaterializedViewsProps = {
  cluster?: Cluster;
};

const createExample = `CREATE MATERIALIZED VIEW winning_bids AS
  SELECT auction_id,
         bid_id,
         item,
         amount
  FROM highest_bid_per_auction
  WHERE end_time < mz_now();`;

const MaterializedViews = ({ cluster }: MaterializedViewsProps) => {
  const { data: materializedViews } = useMaterializedViews(cluster?.id);

  const isLoading = !materializedViews;
  const isEmpty =
    !isLoading && (!materializedViews || materializedViews.length === 0);

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
      )}
      {!isLoading && !isEmpty && (
        <MaterializedViewTable materializedViews={materializedViews} />
      )}
    </>
  );
};

interface MaterializedViewTableProps {
  materializedViews: MaterializedView[];
}

const MaterializedViewTable = (props: MaterializedViewTableProps) => {
  const { colors } = useTheme<MaterializeTheme>();
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
          <Tr
            key={v.name}
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
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default MaterializedViews;
