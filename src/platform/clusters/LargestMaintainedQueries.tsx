import {
  Box,
  Flex,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useTheme,
} from "@chakra-ui/react";
import React from "react";

import useLargestMaintainedQueries from "~/api/materialize/cluster/useLargestMaintainedQueries";
import ErrorBox from "~/components/ErrorBox";
import { EmptyListHeaderContents } from "~/layouts/listPageComponents";
import { MaterializeTheme } from "~/theme";
import useForegroundInterval from "~/useForegroundInterval";

const typeLabel = (type: string) => {
  switch (type) {
    case "index":
      return "Index";
    case "materialized-view":
      return "Materialized View";
    default:
      return type;
  }
};

export interface LargestMaintainedQueriesProps {
  clusterId: string;
  clusterName: string;
  replicaName: string;
}
const LargestMaintainedQueries = ({
  clusterId,
  clusterName,
  replicaName,
}: LargestMaintainedQueriesProps) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();

  const { isInitiallyLoading, results, error, refetch } =
    useLargestMaintainedQueries({
      clusterId,
      clusterName,
      replicaName,
    });
  useForegroundInterval(refetch);

  if (error) {
    return (
      <ErrorBox message="An error has occurred loading maintained queries" />
    );
  }
  return (
    <>
      <Text textStyle="heading-xs">Resource intensive maintained queries</Text>
      <Text textStyle="text-small" color={semanticColors.foreground.secondary}>
        These queries are responsible for the bulk of your resource usage
      </Text>
      {isInitiallyLoading ? (
        <Flex width="100%" alignItems="center" justifyContent="center">
          <Spinner data-testid="loading-spinner" />
        </Flex>
      ) : results.length === 0 ? (
        <EmptyListHeaderContents
          title="No maintained queries found"
          helpText=""
        />
      ) : (
        <Table
          variant="standalone"
          data-testid="source-table"
          borderRadius="xl"
          mt={4}
        >
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Memory</Th>
            </Tr>
          </Thead>
          <Tbody>
            {results.map((r) => (
              <Tr key={r.id}>
                <Td>
                  <Box
                    maxW={{
                      base: "120px",
                      xl: "200px",
                      "2xl": "400px",
                      "3xl": "800px",
                      "4xl": "1200px",
                    }}
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                  >
                    {`${r.databaseName}.${r.schemaName}.${r.name}`}
                  </Box>
                </Td>
                <Td>{typeLabel(r.type)}</Td>
                <Td>{r.memoryPercentage}%</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </>
  );
};

export default LargestMaintainedQueries;
