import { rest } from "msw";

import { buildUseSqlQueryHandler } from "./buildSqlQueryHandler";

export const defaultQueryHandler = rest.post("*/api/sql", (_req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json({
      results: [
        {
          ok: "SET",
        },
        {
          rows: [[1]],
          col_names: ["?column?"],
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

export default [
  useDatabasesHandler,
  useSchemasHandler,
  useSecretsHandler,
  defaultQueryHandler,
];
