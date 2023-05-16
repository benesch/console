import { rest } from "msw";

import { buildUseSqlQueryHandler } from "./buildSqlQueryHandler";

export const defaultQueryHandler = rest.post("*/api/sql", (_req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json({
      results: [
        {
          rows: [["v0.53.0 (92c760eb4)"]],
          col_names: ["mz_version"],
        },
      ],
    })
  );
});

const useDatabasesHandler = buildUseSqlQueryHandler({
  type: "SELECT" as const,
  columns: ["id", "name"],
  rows: [],
});

const useSchemasHandler = buildUseSqlQueryHandler({
  type: "SELECT" as const,
  columns: ["id", "name", "database_id", "database_name"],
  rows: [],
});

const useSecretsHandler = buildUseSqlQueryHandler({
  type: "SELECT" as const,
  columns: ["id", "name", "created_at", "database_name", "schema_name"],
  rows: [],
});

const useClustersHandler = buildUseSqlQueryHandler({
  type: "SELECT" as const,
  columns: ["id", "cluster_name", "replica_id", "replica_name", "size"],
  rows: [],
});

export default [
  useDatabasesHandler,
  useSchemasHandler,
  useSecretsHandler,
  useClustersHandler,
  defaultQueryHandler,
];
