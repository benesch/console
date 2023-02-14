/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


export interface paths {
  "/api/environmentassignment": {
    /** @description List the available environment assignments */
    get: operations["environmentAssignmentsList"];
    /** @description Create a new environment assignment. */
    post: operations["environmentAssignmentsCreate"];
    /** @description Destroy an environment assignment. */
    delete: operations["environmentAssignmentsDestroy"];
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
    EnvironmentAssignment: {
      cluster: string;
      environmentControllerUrl: string;
    };
    EnvironmentAssignmentRequest: {
      environmentdImageRef?: string;
      /** @default false */
      important?: boolean;
      /** Extra environmentd arguments */
      environmentdExtraArgs?: (string)[];
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

  environmentAssignmentsList: {
    /** @description List the available environment assignments */
    responses: {
      200: {
        content: {
          "application/json": (components["schemas"]["EnvironmentAssignment"])[];
        };
      };
    };
  };
  environmentAssignmentsCreate: {
    /** @description Create a new environment assignment. */
    requestBody: {
      content: {
        "application/json": components["schemas"]["EnvironmentAssignmentRequest"];
      };
    };
    responses: {
      201: {
        content: {
          "application/json": components["schemas"]["EnvironmentAssignment"];
        };
      };
    };
  };
  environmentAssignmentsDestroy: {
    /** @description Destroy an environment assignment. */
    responses: {
      /** @description No response body */
      202: never;
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
