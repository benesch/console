import { DeleteIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  HStack,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useInterval,
} from "@chakra-ui/react";
import { TabPanel, TabPanels } from "@chakra-ui/tabs";
import React from "react";

import { Cluster, useClusters } from "../../api/materialized";
import {
  Card,
  CardTab,
  CardTabs,
  CardTabsHeaders,
  CardTitle,
} from "../../components/cardComponents";
import MetricsLineChart from "../../components/metrics/components/MetricsLineChart";
import { EmptyList } from "../../layouts/listPageComponents";
import { semanticColors } from "../../theme/colors";
import { getColorName } from "../../theme/victoryChart";

const MetricsCard = () => {
  const { clusters, refetch } = useClusters();
  useInterval(refetch, 5000);
  const isLoading = clusters === null;
  const isEmpty = !isLoading && clusters.length === 0;
  const borderColor = useColorModeValue(
    semanticColors.divider.light,
    semanticColors.divider.dark
  );
  const allMetricsHook = false;
  return (
    <Card pb={4}>
      <>
        <CardTabs
          data-testid="metrics-card"
          colorScheme="purple"
          borderBottomWidth="1px"
          borderBottomColor={borderColor}
          borderBottomStyle="solid"
        >
          <CardTabsHeaders>
            <CardTitle>Monitoring</CardTitle>
            <HStack>
              <CardTab>Memory</CardTab>
              <CardTab>CPU</CardTab>
            </HStack>
          </CardTabsHeaders>
          <TabPanels>
            <TabPanel>
              {isLoading ? (
                <Spinner data-test-id="loading-spinner" />
              ) : allMetricsHook ? (
                <MetricsLineChart
                  {...allMetricsHook}
                  testId="fetch-memory-metric-error"
                  errorMessage="Failed to load cluster memory metrics"
                />
              ) : (
                "Coming soon."
              )}
            </TabPanel>
            <TabPanel>
              {isLoading ? (
                <Spinner />
              ) : allMetricsHook ? (
                <MetricsLineChart
                  {...allMetricsHook}
                  testId="fetch-cpu-metric-error"
                  errorMessage="Failed to load cluster CPU metrics"
                />
              ) : (
                "Coming soon."
              )}
            </TabPanel>
          </TabPanels>
        </CardTabs>
        {!isLoading && !isEmpty && <ClusterTable clusters={clusters} />}
        {isEmpty && <EmptyList title="clusters" />}
      </>
    </Card>
  );
};

interface ClusterTableProps {
  clusters: Cluster[];
}

const ClusterTable = ({ clusters }: ClusterTableProps) => {
  return (
    <Table data-testid="cluster-table" borderRadius="xl">
      <Thead>
        <Tr>
          <Th></Th>
          <Th>Cluster name</Th>
          <Th>Size</Th>
          <Th></Th>
        </Tr>
      </Thead>
      <Tbody>
        {clusters.map((c: Cluster) => {
          const colorName = getColorName(c.id);
          return (
            <Tr key={`cluster-${c.id}`}>
              <Td px={{ base: 2, md: 4, lg: 6 }} width={4}>
                <Box
                  className={colorName}
                  bg={colorName}
                  w={4}
                  h={4}
                  borderRadius="50%"
                ></Box>
              </Td>
              <Td>{c.name}</Td>
              <Td></Td>
              <Td px={{ base: 2, md: 6 }} width="50px">
                <Button colorScheme="red" variant="outline">
                  <DeleteIcon />
                </Button>
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

export default MetricsCard;
