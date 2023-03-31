/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


export interface paths {
  "/api/organization": {
    /** @description Get the current organization */
    get: operations["currentOrganization"];
  };
  "/api/health": {
    /**
     * @description Basic health check endpoint.
     * 
     * This endpoint always returns 200 OK. It is intended for use by load
     * balancers and such that need a basic indication as to whether the server is
     * live.
     */
    get: operations["healthRetrieve"];
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    Organization: {
      id: string;
      name: string;
      blocked: boolean;
      subscription?: Record<string, never>;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type external = Record<string, never>;

export interface operations {

  currentOrganization: {
    /** @description Get the current organization */
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["Organization"];
        };
      };
    };
  };
  healthRetrieve: {
    /**
     * @description Basic health check endpoint.
     * 
     * This endpoint always returns 200 OK. It is intended for use by load
     * balancers and such that need a basic indication as to whether the server is
     * live.
     */
    responses: {
      /** @description No response body */
      200: never;
    };
  };
}
