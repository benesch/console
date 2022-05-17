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
import { TabPanels } from "@chakra-ui/tabs";
import React from "react";

import { Cluster, useClusters } from "../../api/materialized";
import {
  Card,
  CardTab,
  CardTabs,
  CardTabsHeaders,
  CardTitle,
} from "../../components/cardComponents";
import { EmptyList } from "../../layouts/listPageComponents";
import { semanticColors } from "../../theme/colors";
import { getColorName } from "../../theme/victoryChart";
import { CpuMetricsTabPanel, MemoryMetricsTabPanel } from "./MetricsTabPanels";

const MetricsCard = () => {
  const { clusters, refetch } = useClusters();
  useInterval(refetch, 5000);
  const [period, setPeriod] = React.useState(60);
  const isLoadingClusters = clusters === null;
  const isEmptyClusters = !isLoadingClusters && clusters.length === 0;
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
          isLazy
        >
          <CardTabsHeaders>
            <CardTitle>Monitoring</CardTitle>
            <HStack>
              <CardTab>CPU</CardTab>
              <CardTab>Memory</CardTab>
            </HStack>
          </CardTabsHeaders>
          <TabPanels>
            <CpuMetricsTabPanel period={period} setPeriod={setPeriod} />
            <MemoryMetricsTabPanel period={period} setPeriod={setPeriod} />
          </TabPanels>
        </CardTabs>
        {!isLoadingClusters && !isEmptyClusters && (
          <ClusterTable clusters={clusters} />
        )}
        {isEmptyClusters && <EmptyList title="clusters" />}
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
