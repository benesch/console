import { Response, Server } from "miragejs";

import { validDeployment } from "../../deployments/__mocks__";

export const testApiBase = "https://example.com";

export const createApiLayerMock = () => {
  const getApiDeployementsHandler = jest.fn(() => {
    // status, header, data
    return new Response(200, {}, [validDeployment]);
  });
  return {
    handlers: {
      getApiDeployementsHandler,
    },
    server: new Server({
      environment: "test",
      logging: true,
      routes() {
        this.urlPrefix = testApiBase;
        this.get("/api/deployments", getApiDeployementsHandler);
      },
    }),
  };
};

export type ApiLayerMock = ReturnType<typeof createApiLayerMock>;
