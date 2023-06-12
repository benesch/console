import { Box, Flex, HStack, Spinner, Text, useTheme } from "@chakra-ui/react";
import * as Sentry from "@sentry/react";
import { subMinutes } from "date-fns";
import React from "react";
import { useParams } from "react-router-dom";

import { useClusters } from "~/api/materialize/useClusters";
import useClusterUtilization, {
  ReplicaUtilization,
} from "~/api/materialize/useClusterUtilization";
import ErrorBox from "~/components/ErrorBox";
import LabeledSelect from "~/components/LabeledSelect";
import TimePeriodSelect, {
  useTimePeriodMinutes,
} from "~/components/TimePeriodSelect";
import { MaterializeTheme } from "~/theme";

import { ClusterParams } from "./ClusterRoutes";
import ClusterUtilizationGraph, { DataPoint } from "./ClusterUtilizationGraph";
import { CLUSTERS_FETCH_ERROR_MESSAGE } from "./constants";

export interface ReplicaData {
  id: string;
  data: DataPoint[];
}
const graphHeightPx = 300;
const labelHeightPx = 18;
// because the data is sampled on 60s intervals, we don't want to show more granular data than this.
const minBucketSizeMs = 60 * 1000;

const ClusterOverview = () => {
  const {
    colors: { semanticColors },
  } = useTheme<MaterializeTheme>();
  const { id: clusterId } = useParams<ClusterParams>();
  const {
    getClusterById,
    isInitiallyLoading: isClusterLoading,
    isError: isClusterError,
    error: clusterLoadError,
  } = useClusters();
  const cluster = getClusterById(clusterId);
  const [timePeriodMinutes, setTimePeriodMinutes] = useTimePeriodMinutes();
  const [endTime, setEndTime] = React.useState(new Date());
  const [selectedReplica, setSelectedReplica] = React.useState("all");
  const startTime = React.useMemo(() => {
    return subMinutes(endTime, timePeriodMinutes);
  }, [timePeriodMinutes, endTime]);
  React.useEffect(() => setEndTime(new Date()), [timePeriodMinutes]);

  const { data, errors, isStale } = useClusterUtilization(
    clusterId,
    startTime,
    endTime,
    selectedReplica === "all" ? undefined : selectedReplica
  );

  const selectedReplicas = React.useMemo(() => {
    if (!cluster) return [];

    if (selectedReplica === "all") {
      return cluster.replicas;
    }
    const replica = cluster.replicas.find((r) => r.id === selectedReplica);
    if (!replica) {
      return cluster.replicas;
    }
    return [replica];
  }, [cluster, selectedReplica]);
  const replicaColorMap = React.useMemo(() => {
    return new Map(
      cluster?.replicas.map((r, i) => [
        r.id,
        { name: r.name, color: semanticColors.lineGraph[i] },
      ])
    );
  }, [cluster?.replicas, semanticColors.lineGraph]);

  const bucketSizeMs = React.useMemo(
    () => Math.max(timePeriodMinutes * 1000, minBucketSizeMs),
    [timePeriodMinutes]
  );

  const buckets = React.useMemo(() => {
    const startTimestamp = startTime.getTime();
    const endTimestamp = endTime.getTime();
    const result = [];
    let currentBucket = startTimestamp;
    while (currentBucket < endTimestamp) {
      result.push(currentBucket);
      currentBucket += bucketSizeMs;
    }
    return result;
  }, [bucketSizeMs, endTime, startTime]);

  type ReplicaId = string;
  type Timestamp = number;
  type ReplicaMap = Map<ReplicaId, ReplicaUtilization[]>;

  const graphData = React.useMemo(() => {
    if (!cluster || !data) return undefined;

    const bucketMap = new Map<Timestamp, ReplicaMap>();
    for (const datum of data) {
      const bucket = buckets.find(
        (b) =>
          // greater than the start of the bucket, less than the end
          datum.timestamp >= b && datum.timestamp <= b + bucketSizeMs
      );
      if (!bucket) {
        continue;
      }
      const replicaMap = bucketMap.get(bucket);

      if (replicaMap) {
        const replicaBucket = replicaMap.get(datum.id);
        if (replicaBucket) {
          replicaBucket.push(datum);
        } else {
          replicaMap.set(datum.id, [datum]);
        }
      } else {
        bucketMap.set(bucket, new Map([[datum.id, [datum]]]));
      }
    }
    const chartData: ReplicaData[] = [];
    for (const replica of selectedReplicas ?? []) {
      const lineData: DataPoint[] = [];
      for (const [bucket, replicaMap] of bucketMap.entries()) {
        if (!replica) continue;
        const utilizations = replicaMap.get(replica.id);
        if (!utilizations) {
          continue;
        }
        let maxCpu = utilizations[0];
        for (const value of utilizations) {
          if (value.cpuPercent > maxCpu.cpuPercent) {
            maxCpu = value;
          }
        }
        let maxMemory = utilizations[0];
        for (const value of utilizations) {
          if (value.memoryPercent > maxMemory.memoryPercent) {
            maxMemory = value;
          }
        }
        const bucketValue: DataPoint = {
          id: replica.id,
          name: replica.name,
          size: replica.size,
          timestamp: bucket,
          cpuPercent: maxCpu.cpuPercent,
          memoryPercent: maxMemory.memoryPercent,
        };
        lineData.push(bucketValue);
      }
      chartData.push({
        id: replica.id,
        data: lineData.sort((a, b) => a.timestamp - b.timestamp),
      });
    }
    return chartData;
  }, [bucketSizeMs, buckets, cluster, data, selectedReplicas]);

  if (clusterLoadError) {
    Sentry.captureException(
      new Error("Cluster Overview cluster load error: " + clusterLoadError)
    );
  }
  if (errors.length > 0) {
    Sentry.captureException(
      new Error(
        "Cluster Overview utilization load error:\n" + errors.join("\n")
      )
    );
  }
  if (isClusterError || errors.length > 0) {
    Sentry.captureException(
      new Error("Cluster Overview error:\n" + errors.join("\n"))
    );
    return <ErrorBox message={CLUSTERS_FETCH_ERROR_MESSAGE} />;
  }

  const isLoading = isClusterLoading || isStale || !graphData;

  return (
    <Box
      border={`solid 1px ${semanticColors.border.primary}`}
      borderRadius="8px"
      py={4}
      px={6}
      width="100%"
      minW="460px"
    >
      <Flex
        width="100%"
        alignItems="start"
        justifyContent="space-between"
        mb="6"
      >
        <Text as="h3" fontSize="18px" lineHeight="20px" fontWeight={500}>
          Resource Usage
        </Text>
        <HStack>
          {cluster && (
            <LabeledSelect
              label="Replicas"
              value={selectedReplica}
              onChange={(e) => setSelectedReplica(e.target.value)}
            >
              <option value="all">All</option>
              {cluster.replicas.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </LabeledSelect>
          )}
          <TimePeriodSelect
            timePeriodMinutes={timePeriodMinutes}
            setTimePeriodMinutes={setTimePeriodMinutes}
          />
        </HStack>
      </Flex>
      <HStack spacing={6}>
        {isLoading ? (
          <Flex
            height={graphHeightPx + labelHeightPx}
            width="100%"
            alignItems="center"
            justifyContent="center"
          >
            <Spinner data-testid="loading-spinner" />
          </Flex>
        ) : (
          <>
            <Box width="100%">
              <Text fontSize="sm" lineHeight="16px" mb={2} fontWeight={500}>
                CPU
              </Text>
              <ClusterUtilizationGraph
                dataKey="cpuPercent"
                data={graphData}
                startTime={startTime}
                endTime={endTime}
                timePeriodMinutes={timePeriodMinutes}
                replicaColorMap={replicaColorMap}
                replicas={selectedReplicas}
              />
            </Box>
            <Box width="100%">
              <Text fontSize="sm" lineHeight="16px" mb={2} fontWeight={500}>
                Memory
              </Text>
              <ClusterUtilizationGraph
                dataKey="memoryPercent"
                data={graphData}
                startTime={startTime}
                endTime={endTime}
                timePeriodMinutes={timePeriodMinutes}
                replicaColorMap={replicaColorMap}
                replicas={selectedReplicas}
              />
            </Box>
          </>
        )}
      </HStack>
    </Box>
  );
};

export default ClusterOverview;
