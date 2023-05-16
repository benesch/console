import { Fetcher } from "openapi-typescript-fetch";

import { consoleVersionHeaders } from "../version/api";
import { components, paths } from "./schemas/region-controller";

export type EnvironmentAssignment =
  components["schemas"]["EnvironmentAssignment"];

const fetcher = Fetcher.for<paths>();
const createEnvironmentAssignmentFn = fetcher
  .path("/api/environmentassignment")
  .method("post")
  .create();

export const environmentAssignmentList = (
  regionControllerUrl: string,
  accessToken: string
) => {
  const fetcherForEnv = Fetcher.for<paths>();
  fetcherForEnv.configure({
    baseUrl: regionControllerUrl,
    init: {
      headers: {
        ...consoleVersionHeaders(),
        authorization: `Bearer ${accessToken}`,
      },
    },
  });

  return fetcherForEnv
    .path("/api/environmentassignment")
    .method("get")
    .create()({});
};

export const createEnvironmentAssignment = (
  regionControllerUrl: string,
  args: Parameters<typeof createEnvironmentAssignmentFn>[0],
  accessToken: string
) => {
  const fetcherForEnv = Fetcher.for<paths>();
  fetcherForEnv.configure({
    baseUrl: regionControllerUrl,
    init: {
      headers: {
        ...consoleVersionHeaders(),
        authorization: `Bearer ${accessToken}`,
      },
    },
  });

  return fetcherForEnv
    .path("/api/environmentassignment")
    .method("post")
    .create()(args);
};
