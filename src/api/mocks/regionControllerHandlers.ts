import { rest } from "msw";

export default [
  rest.get("/api/environmentassignment", (_req, res, ctx) => {
    return res(ctx.status(200));
  }),
];
