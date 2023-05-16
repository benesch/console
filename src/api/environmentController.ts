import { Fetcher } from "openapi-typescript-fetch";

import { consoleVersionHeaders } from "../version/api";
import { components, paths } from "./schemas/environment-controller";

export type Environment = components["schemas"]["Environment"];

export const environmentList = (
  environmentControllerUrl: string,
  accessToken: string
) => {
  const fetcher = Fetcher.for<paths>();
  fetcher.configure({
    baseUrl: environmentControllerUrl,
    init: {
      headers: {
        ...consoleVersionHeaders(),
        authorization: `Bearer ${accessToken}`,
      },
    },
  });

  return fetcher.path("/api/environment").method("get").create()({});
};
