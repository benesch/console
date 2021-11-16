import { Response, Server } from "miragejs";

import {
  validDeployment,
  validPrometheusValues,
} from "../../deployments/__mocks__";

export const testApiBase = "https://example.com";

export const validDeploymentId = "123";
export const invalidDeploymentId = "456";

export const createApiLayerMock = () => {
  const getApiDeploymentsHandler = jest.fn(() => {
    // status, header, data
    return new Response(200, {}, [validDeployment]);
  });

  const getMetricsHandler = jest.fn(() => {
    // status, header, data
    return new Response(200, {}, validPrometheusValues);
  });
  return {
    handlers: {
      getApiDeploymentsHandler,
      getMetricsHandler,
    },
    server: new Server({
      environment: "test",
      logging: true,
      routes() {
        this.urlPrefix = testApiBase;
        this.get("/api/deployments", getApiDeploymentsHandler);
        this.get(
          `/api/deployments/${validDeploymentId}/metrics/memory/:period`,
          getMetricsHandler
        );

        this.get(
          `/api/deployments/${validDeploymentId}/metrics/cpu/:period`,
          getMetricsHandler
        );
      },
    }),
  };
};

export type ApiLayerMock = ReturnType<typeof createApiLayerMock>;
