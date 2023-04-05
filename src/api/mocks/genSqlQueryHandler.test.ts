import server from "~/api/mocks/server";

import {
  extractSQLSelectColumnNames,
  genSqlQueryHandler,
} from "./genSqlQueryHandler";

const MOCK_API_URL = new URL("http://materialize/api/sql");

describe("extractSQLSelectColumnNames", () => {
  it("SELECT statements with a star as the column", () => {
    const query = `SELECT * FROM export_to_dataflow;`;
    expect(extractSQLSelectColumnNames(query)).toEqual(["*"]);
  });

  it("SELECT statements with aliases", () => {
    const query = `
        SELECT
            export_id, 
            coalesce(mas.records, 0) AS arrangement_records
        FROM export_to_dataflow;
`;
    expect(extractSQLSelectColumnNames(query)).toEqual([
      "export_id",
      "arrangement_records",
    ]);
  });

  it("SELECT statements with functions", () => {
    const query = `
        SELECT 
            MAX(extract(epoch from h.occurred_at) * 1000), 
            h.error
        FROM mz_source_status_history;
`;
    expect(extractSQLSelectColumnNames(query)).toEqual(["max", "error"]);
  });

  it("SELECT statements with namespaces", () => {
    const query = `
        SELECT 
            h.error
        FROM mz_source_status_history;
    `;
    expect(extractSQLSelectColumnNames(query)).toEqual(["error"]);
  });

  it("SELECT statements with expressions past FROM", () => {
    const query = `
        SELECT id
        FROM mz_cluster_replicas r
        JOIN mz_clusters c ON c.id = r.id
        ORDER BY r.id;
    `;
    expect(extractSQLSelectColumnNames(query)).toEqual(["id"]);
  });

  it("SELECT statements with multiple nested SELECT statements", () => {
    const query = `
        SELECT
            mdco.id,
            from_operator_id,
            to_operator_id,
            COALESCE(sum(sent), 0) AS sent
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
            to_operator_id;`;

    expect(extractSQLSelectColumnNames(query)).toEqual([
      "id",
      "from_operator_id",
      "to_operator_id",
      "sent",
    ]);
  });
});

describe("genSqlQueryHandler", () => {
  it("should not intercept when queries are in incorrect order", async () => {
    const mockQueries = [
      {
        type: "SET" as const,
      },
      {
        type: "CREATE" as const,
      },
    ];
    const requestQueries = [
      {
        query: `CREATE SECRET;`,
        params: [],
      },
      { query: `SET cluster=mz_introspection;`, params: [] },
    ];
    server.use(genSqlQueryHandler(mockQueries));

    const response = await fetch(MOCK_API_URL, {
      method: "POST",
      body: JSON.stringify({
        queries: requestQueries,
      }),
    });

    const body = await response.json();

    expect(body).not.toEqual({
      results: [
        { ok: "SET;", notices: [] },
        { ok: "CREATE;", notices: [] },
      ],
    });
  });

  it("should intercept select query when order of columns are incorrect", async () => {
    const mockColumns = ["id", "replica_name"];
    const mockRows = [["id_1", "replica_1"]];
    const mockQueries = [
      {
        type: "SELECT" as const,
        columns: mockColumns,
        rows: mockRows,
      },
    ];
    const requestQueries = [
      {
        query: `
            SELECT 
                r.name as replica_name,
                r.id
            FROM mz_cluster_replicas;
        `,
        params: [],
      },
    ];
    server.use(genSqlQueryHandler(mockQueries));

    const response = await fetch(MOCK_API_URL, {
      method: "POST",
      body: JSON.stringify({
        queries: requestQueries,
      }),
    });

    const body = await response.json();

    expect(body).toEqual({
      results: [
        {
          rows: [["replica_1", "id_1"]],
          col_names: ["replica_name", "id"],
          tag: "SELECT 1",
          notices: [],
        },
      ],
    });
  });

  it("should intercept simple select query with mock rows", async () => {
    const mockRows = [["id_1", "replica_1", "cluster_1", 100, "10%"]];
    const mockColumns = [
      "id",
      "replica_name",
      "cluster_id",
      "size",
      "memory_percent",
    ];
    const mockQueries = [
      {
        type: "SELECT" as const,
        columns: mockColumns,
        rows: mockRows,
      },
    ];
    const requestQueries = [
      {
        query: `
            SELECT 
                r.id,
                r.name as replica_name,
                r.cluster_id,
                r.size,
                u.memory_percent
            FROM mz_cluster_replicas;
        `,
        params: [],
      },
    ];
    server.use(genSqlQueryHandler(mockQueries));

    const response = await fetch(MOCK_API_URL, {
      method: "POST",
      body: JSON.stringify({
        queries: requestQueries,
      }),
    });

    const body = await response.json();

    expect(body).toEqual({
      results: [
        {
          rows: mockRows,
          col_names: mockColumns,
          tag: "SELECT 1",
          notices: [],
        },
      ],
    });
  });

  it("multiple handlers should intercept their respective queries", async () => {
    const mockSelectQuery1 = {
      type: "SELECT" as const,
      columns: ["id", "replica_name", "cluster_id", "size", "memory_percent"],
      rows: [["id_1", "replica_1", "cluster_1", 100, "10%"]],
    };

    const request1 = [
      {
        query: `
            SELECT 
                r.id,
                r.name as replica_name,
                r.cluster_id,
                r.size,
                u.memory_percent
            FROM mz_cluster_replicas;
        `,
        params: [],
      },
    ];

    const mockSelectQuery2 = {
      type: "SELECT" as const,
      columns: ["cluster_id"],
      rows: [["cluster_id_1"]],
    };

    const request2 = [
      {
        query: `
            SELECT cluster_id FROM mz_cluster_replicas
        `,
        params: [],
      },
    ];
    server.use(genSqlQueryHandler([mockSelectQuery1]));
    server.use(genSqlQueryHandler([mockSelectQuery2]));

    const response1 = await fetch(MOCK_API_URL, {
      method: "POST",
      body: JSON.stringify({
        queries: request1,
      }),
    });

    const response2 = await fetch(MOCK_API_URL, {
      method: "POST",
      body: JSON.stringify({
        queries: request2,
      }),
    });

    const body1 = await response1.json();
    const body2 = await response2.json();

    expect(body1).toEqual({
      results: [
        {
          rows: mockSelectQuery1.rows,
          col_names: mockSelectQuery1.columns,
          tag: "SELECT 1",
          notices: [],
        },
      ],
    });

    expect(body2).toEqual({
      results: [
        {
          rows: mockSelectQuery2.rows,
          col_names: mockSelectQuery2.columns,
          tag: "SELECT 1",
          notices: [],
        },
      ],
    });
  });

  it("should set a custom 'ok' object in the API call's response if sent in the mock query", async () => {
    const mockCommitQuery = {
      type: "COMMIT" as const,
      ok: "Commit successful.",
    };
    const requestQueries = [{ query: `COMMIT;`, params: [] }];
    server.use(genSqlQueryHandler([mockCommitQuery]));

    const response = await fetch(MOCK_API_URL, {
      method: "POST",
      body: JSON.stringify({
        queries: requestQueries,
      }),
    });

    const body = await response.json();

    expect(body).toEqual({
      results: [{ ok: mockCommitQuery.ok, notices: [] }],
    });
  });

  it("should set a custom 'error' object in the API call's response if sent in the mock query", async () => {
    const mockCommitQuery = {
      type: "COMMIT" as const,
      error: "Commit unsuccessful.",
    };
    const requestQueries = [{ query: `COMMIT;`, params: [] }];
    server.use(genSqlQueryHandler([mockCommitQuery]));

    const response = await fetch(MOCK_API_URL, {
      method: "POST",
      body: JSON.stringify({
        queries: requestQueries,
      }),
    });

    const body = await response.json();

    expect(body).toEqual({
      results: [{ error: mockCommitQuery.error, notices: [] }],
    });
  });
});
