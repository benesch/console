import {
  Box,
  HStack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useTheme,
} from "@chakra-ui/react";
import * as Sentry from "@sentry/react";
import React from "react";

import useLargestMaintainedQueries from "~/api/materialize/cluster/useLargestMaintainedQueries";
import ErrorBox from "~/components/ErrorBox";
import infoSvg from "~/img/info.svg";
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
}
const LargestMaintainedQueries = ({
  clusterId,
  clusterName,
}: LargestMaintainedQueriesProps) => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();

  const { isInitiallyLoading, results, replicaName, error, refetch } =
    useLargestMaintainedQueries({
      clusterId,
      clusterName,
    });
  useForegroundInterval(refetch);

  if (
    error === "cannot execute queries on cluster containing sources or sinks"
  ) {
    // We could try again and check this up front, but there would still be a race conditon, so we will just ignore the error
    return null;
  }
  if (error) {
    Sentry.captureException(
      new Error("LargestMaintainedQueries failed to load:\n" + error)
    );
    return (
      <ErrorBox message="An error has occurred loading maintained queries" />
    );
  }
  if (!isInitiallyLoading && results.length === 0) {
    // If the cluster has no maintained queries, show nothing
    return null;
  }
  return (
    <>
      <Text textStyle="heading-xs">Resource intensive objects</Text>
      <HStack spacing={1}>
        <Text
          textStyle="text-small"
          color={semanticColors.foreground.secondary}
        >
          These objects are using the most resources on this cluster.
        </Text>
        <Tooltip
          label={`These metrics are pulled from replica: ${replicaName}`}
        >
          <img src={infoSvg} />
        </Tooltip>
      </HStack>
      <Table variant="standalone" borderRadius="xl" mt={4}>
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
    </>
  );
};

export default LargestMaintainedQueries;
