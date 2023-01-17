import { rest } from "msw";

import server from "../api/mocks/server";
import { EnabledEnvironment, fetchEnvironmentHealth } from "./environments";

const accessToken = "fake-access-token";
const enabledEnvironment: EnabledEnvironment = {
  state: "enabled",
  health: "pending",
  errors: [],
  environmentdPgwireAddress:
    "bq8fty4m0jkx79hdw3zh8ers3.us-east-1.aws.staging.materialize.cloud:6875",
  environmentdHttpsAddress:
    "bq8fty4m0jkx79hdw3zh8ers3.us-east-1.aws.staging.materialize.cloud:443",
  resolvable: true,
  creationTimestamp: new Date().toISOString(),
};

describe("recoil/environments", () => {
  describe("fetchEnvironmentHealth", () => {
    it("return healthy for a successful response", async () => {
      const result = await fetchEnvironmentHealth(
        enabledEnvironment,
        accessToken
      );
      expect(result.health).toEqual("healthy");
      expect(result.errors).toEqual([]);
    });

    it("should return crashed when there is an error", async () => {
      server.use(
        rest.post("*/api/sql", (_req, res, ctx) => {
          return res(ctx.status(400), ctx.text("bad request"));
        })
      );
      const result = await fetchEnvironmentHealth(
        enabledEnvironment,
        accessToken
      );
      expect(result.health).toEqual("crashed");
      expect(result.errors).toEqual([
        {
          message: "bad request",
        },
      ]);
    });

    it("should return booting when there is a timeout", async () => {
      server.use(
        rest.post("*/api/sql", (_req, res, ctx) => {
          return new Promise((resolve) => {
            setTimeout(() => resolve(res(ctx.status(200))), 10);
          });
        })
      );
      const result = await fetchEnvironmentHealth(
        enabledEnvironment,
        accessToken,
        1 // 1ms timeout
      );
      expect(result.health).toEqual("booting");
      expect(result.errors).toEqual([]);
    });

    it("should return crashed when not responsive for longer than max boot time", async () => {
      server.use(
        rest.post("*/api/sql", (_req, res, ctx) => {
          return new Promise((resolve) => {
            setTimeout(() => resolve(res(ctx.status(200))), 10);
          });
        })
      );
      const result = await fetchEnvironmentHealth(
        enabledEnvironment,
        accessToken,
        2, // 2ms timeout
        { seconds: 0.001 } // 1ms max boot time
      );
      expect(result.health).toEqual("crashed");
      expect(result.errors).toEqual([
        {
          details: expect.objectContaining({
            name: "AbortError",
            message: "The user aborted a request.",
          }),
          message: "Environment is unresponsive for unknown reason",
        },
      ]);
    });
  });
});
