import { Fetcher } from "openapi-typescript-fetch";

import { components, paths } from "./schemas/environment-controller";

export type Environment = components["schemas"]["Environment"];

export const environmentList = (
  environmentControllerUrl: string,
  accessToken: string
) => {
  const fetcher = Fetcher.for<paths>();
  fetcher.configure({
    baseUrl: environmentControllerUrl,
  });

  return fetcher.path("/api/environment").method("get").create()(
    {},
    {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    }
  );
};
