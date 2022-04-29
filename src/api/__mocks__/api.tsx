import { Request, Response, Server } from "miragejs";

import {
  validDeployment,
  validDeploymentList,
  validPrometheusValues,
  validRegions,
} from "../../components/metrics/__mocks__";

export const testApiBase = "https://example.com";

export const validDeploymentId = "123";
export const invalidDeploymentId = "456";

export const createApiLayerMock = () => {
  const getApiDeploymentsHandler = jest.fn(() => {
    // status, header, data
    return new Response(200, {}, validDeploymentList);
  });

  const getApiDeploymentHandler = jest.fn(() => {
    // status, header, data
    return new Response(200, {}, validDeployment);
  });

  const getMetricsHandler = jest.fn(() => {
    // status, header, data
    return new Response(200, {}, validPrometheusValues);
  });

  const partialUpdateHandler = jest.fn(() => {
    // status, header, data
    return new Response(200, {});
  });

  const getRegionsListHandler = jest.fn(() => {
    return new Response(200, {}, validRegions);
  });
  return {
    handlers: {
      getApiDeploymentsHandler,
      getApiDeploymentHandler,
      getMetricsHandler,
      getRegionsListHandler,
      partialUpdateHandler,
    },
    server: new Server({
      environment: "test",
      logging: true,
      routes() {
        this.urlPrefix = testApiBase;
        this.get("/api/deployments", getApiDeploymentsHandler);
        this.get("/api/deployments/:id", getApiDeploymentHandler);
        this.patch("/api/deployments/:id", partialUpdateHandler);
        this.get("/api/regions/:providerId", getRegionsListHandler);
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

export const receivedRequestsBodyFromMock = (
  mock: jest.Mock<any, any> | undefined
): any[] => {
  if (!mock) return [];
  // the second argument is the request object
  const requests: Request[] = mock.mock.calls.map(([_, request]) => request);
  return requests.map((request) => {
    try {
      const bodyJSON = request.requestBody;
      return bodyJSON;
    } catch {
      return [];
    }
  });
};

export type ApiLayerMock = ReturnType<typeof createApiLayerMock>;
