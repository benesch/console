import React from "react";

import { extractData, useSqlMany } from "~/api/materialized";

export interface DataflowQuery {
  clusterId: string;
  replicaId: string;
  // catalog ID, not any kind of internal DF id
  objectId: string;
}

export interface DataflowQuery {
  clusterId: string;
  replicaId: string;
  // catalog ID, not any kind of internal DF id
  objectId: string;
}

export interface Operator {
  id: number;
  name: string;
  parentId: number | null;
  arrangementRecords: number;
  elapsedNs: number;
}

export interface Channel {
  id: number;
  fromOperatorId: number;
  toOperatorId: number;
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
  mce.dataflow_id = md.local_id WHERE mce.worker_id = 0 AND md.worker_id = 0`,
          params: [],
        },
        // OPERATORS
        {
          query: `CREATE TEMPORARY VIEW all_ops AS	
	SELECT
		e2d.export_id, mdod.id, mdod.name, mdop.parent_id, coalesce(mas.records, 0) AS arrangement_records,
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
	WHERE
		mdod.worker_id = 0
                AND coalesce(mdop.worker_id, 0) = 0
                AND coalesce(mse.worker_id, 0) = 0
                AND coalesce(mas.worker_id, 0) = 0`,
          params: [],
        },
        { query: "BEGIN", params: [] },
        // CHANNELS
        {
          query: `
SELECT
	mdco.id,
	from_operator_id,
	to_operator_id,
	COALESCE(sum(sent), 0) AS sent
	-- COALESCE(sum(received), 0) AS received
FROM
	mz_internal.mz_dataflow_channel_operators AS mdco
	LEFT JOIN mz_internal.mz_message_counts AS mmc ON
			mdco.id = mmc.channel_id
        JOIN mz_internal.mz_dataflow_operator_dataflows mdod ON from_operator_id = mdod.id
        JOIN export_to_dataflow e2d ON e2d.id = mdod.dataflow_id
WHERE
	mdco.worker_id = 0
AND e2d.export_id = $1
	AND (
			EXISTS(
				SELECT
					1
				FROM
					all_ops
				WHERE
					all_ops.id = mdco.from_operator_id
			)
			OR EXISTS(
					SELECT
						1
					FROM
						all_ops
					WHERE
						all_ops.id = mdco.to_operator_id
				)
		)
GROUP BY
	mdco.id,
	from_operator_id,
	to_operator_id`,
          params: [objectId],
        },
        {
          query: `SELECT id, name, parent_id, arrangement_records, elapsed_ns FROM all_ops WHERE export_id = $1`,
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
      const channelsData = response.data[5];
      const operatorsData = response.data[6];
      const operators = extractData(operatorsData, (x) => ({
        id: x("id") as number,
        name: x("name"),
        parentId: x("parent_id") as number | null,
        arrangementRecords: x("arrangement_records") as number,
        elapsedNs: x("elapsed_ns") as number,
      }));
      const channels = extractData(channelsData, (x) => ({
        id: x("id") as number,
        fromOperatorId: x("from_operator_id") as number,
        toOperatorId: x("to_operator_id") as number,
        messagesSent: x("sent") as number,
      }));
      return { operators, channels };
    } else {
      return null;
    }
  }, [response.data]);
  return { ...response, data: structure };
}
