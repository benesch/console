import { rest } from "msw";

export default [
  rest.post("*/api/sql", (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        results: [
          {
            ok: "SET",
          },
          {
            rows: [1],
            col_names: ["?column?"],
          },
        ],
      })
    );
  }),
];
