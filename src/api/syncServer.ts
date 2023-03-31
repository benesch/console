import { Fetcher } from "openapi-typescript-fetch";

import { versionHeaders } from "../version/api";
import { components, paths } from "./schemas/sync-server";

export type Organization = components["schemas"]["Organization"];

export const currentOrganization = (
  syncServerUrl: string,
  accessToken: string
) => {
  const fetcher = Fetcher.for<paths>();
  fetcher.configure({
    baseUrl: syncServerUrl,
    init: {
      headers: {
        ...versionHeaders(),
        authorization: `Bearer ${accessToken}`,
      },
    },
  });

  return fetcher.path("/api/organization").method("get").create()({});
};
