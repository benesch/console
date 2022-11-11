import { rest } from "msw";

export default [
  rest.post("*/api/environment", (_req, res, ctx) => {
    return res(ctx.status(200));
  }),
];
