import { rest } from "msw";

import { genUseSqlQueryHandler } from "./genSqlQueryHandler";

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

const useDatabasesHandler = genUseSqlQueryHandler({
  type: "SELECT" as const,
  columns: ["id", "name"],
  rows: [],
});

const useSchemasHandler = genUseSqlQueryHandler({
  type: "SELECT" as const,
  columns: ["id", "name", "database_id", "database_name"],
  rows: [],
});

const useSecretsHandler = genUseSqlQueryHandler({
  type: "SELECT" as const,
  columns: ["id", "name", "database_name", "schema_name"],
  rows: [],
});

export default [
  useDatabasesHandler,
  useSchemasHandler,
  useSecretsHandler,
  defaultQueryHandler,
];

// results
// :
// [{ok: "SET", notices: []}, {tag: "SELECT 1", rows: [[1]], col_names: ["?column?"], notices: []}]
// 0
// :
// {ok: "SET", notices: []}
// notices
// :
// []
// ok
// :
// "SET"
// 1
// :
// {tag: "SELECT 1", rows: [[1]], col_names: ["?column?"], notices: []}
// col_names
// :
// ["?column?"]
// notices
// :
// []
// rows
// :
// [[1]]
// tag
// :
// "SELECT 1"

// [
//     {
//         "query": "SET cluster=mz_introspection",
//         "params": []
//     },
//     {
//         "query": "SELECT 1",
//         "params": []
//     }
// ]
