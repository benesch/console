import React from "react";

import { extractData, useSqlMany } from "~/api/materialized";

export interface DataflowQuery {
  clusterId: string;
  replicaId: string;
  // catalog ID, not any kind of internal DF id
  objectId: string;
}

export interface Operator {
  id: number;
  address: number[];
  name: string;
  parentId: number | null;
  arrangementRecords: number;
  elapsedNs: number;
}

export interface Channel {
  id: number;
  fromOperatorId: number | null;
  fromOperatorAddress: number[];
  fromPort: number;
  toOperatorId: number | null;
  toOperatorAddress: number[];
  toPort: number;
  messagesSent: number;
}

export interface DataflowStructure {
  operators: Operator[];
  channels: Channel[];
}

export interface DataflowStructureParams {
  clusterName: string;
  replicaId: string;
  objectId: string;
}

export function useDataflowStructure(params?: DataflowStructureParams) {
  const request = React.useMemo(() => {
    if (!params) {
      return undefined;
    }
    const { clusterName, replicaId, objectId } = params;
    return {
      queries: [
        {
          query: `CREATE TEMPORARY VIEW export_to_dataflow AS
  SELECT export_id, id FROM mz_internal.mz_compute_exports AS mce JOIN mz_internal.mz_dataflows AS md ON
  mce.dataflow_id = md.id`,
          params: [],
        },
        // OPERATORS
        {
          query: `CREATE TEMPORARY VIEW all_ops AS
        SELECT
                e2d.export_id, mdod.id, mda.address, mdod.name, mdop.parent_id, coalesce(mas.records, 0) AS arrangement_records,
                coalesce(mse.elapsed_ns, 0) AS elapsed_ns
        FROM
                export_to_dataflow AS e2d
                JOIN mz_internal.mz_dataflow_operator_dataflows
                                AS mdod ON e2d.id = mdod.dataflow_id
                LEFT JOIN mz_internal.mz_scheduling_elapsed
                                AS mse ON mdod.id = mse.id
                LEFT JOIN mz_internal.mz_arrangement_sizes
                                AS mas ON mdod.id = mas.operator_id
                LEFT JOIN mz_internal.mz_dataflow_operator_parents
                                AS mdop ON mdod.id = mdop.id
                LEFT JOIN mz_internal.mz_dataflow_addresses
                                AS mda ON mdod.id = mda.id`,
          params: [],
        },
        { query: "BEGIN", params: [] },
        // CHANNELS
        {
          query: `
SELECT
        mdco.id,
        from_operator_id,
        from_operator_address,
        from_port,
        to_operator_id,
        to_operator_address,
        to_port,
        COALESCE(sum(sent), 0) AS sent
FROM
        mz_internal.mz_dataflow_channel_operators AS mdco
        JOIN mz_internal.mz_dataflow_channels AS mdc ON
                        mdc.id = mdco.id
        LEFT JOIN mz_internal.mz_message_counts AS mmc ON
                        mdco.id = mmc.channel_id
        JOIN mz_internal.mz_compute_exports mce ON mce.dataflow_id = from_operator_address[1]
WHERE mce.export_id = $1
GROUP BY
        mdco.id,
        from_operator_id,
        from_operator_address,
        to_operator_id,
        to_operator_address,
        from_port,
        to_port`,
          params: [objectId],
        },
        {
          query: `SELECT id, address, name, parent_id, arrangement_records, elapsed_ns FROM all_ops WHERE export_id = $1`,
          params: [objectId],
        },
        {
          query: `COMMIT`,
          params: [],
        },
      ],
      cluster: clusterName,
      replica: replicaId,
    };
  }, [params]);
  const response = useSqlMany(request);
  const structure: DataflowStructure | null = React.useMemo(() => {
    if (response.data) {
      const channelsData = response.data[3];
      const operatorsData = response.data[4];
      const operators = extractData(operatorsData, (x) => ({
        id: x("id") as number,
        address: x("address") as number[],
        name: x("name"),
        parentId: x("parent_id") as number | null,
        arrangementRecords: parseInt(x("arrangement_records") as string),
        elapsedNs: x("elapsed_ns") as number,
      }));
      const channels = extractData(channelsData, (x) => ({
        id: x("id") as number,
        fromOperatorId: x("from_operator_id") as number,
        fromOperatorAddress: x("from_operator_address") as number[],
        fromPort: x("from_port") as number,
        toOperatorId: x("to_operator_id") as number,
        toOperatorAddress: x("to_operator_address") as number[],
        toPort: x("to_port") as number,
        messagesSent: parseInt(x("sent") as string),
      }));
      return { operators, channels };
    } else {
      return null;
    }
  }, [response.data]);
  return { ...response, data: structure };
}
