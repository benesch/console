import { Fetcher } from "openapi-typescript-fetch";

import { versionHeaders } from "../version/api";
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
        ...versionHeaders(),
        authorization: `Bearer ${accessToken}`,
      },
    },
  });

  return fetcher.path("/api/environment").method("get").create()({});
};
