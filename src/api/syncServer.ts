import { Fetcher } from "openapi-typescript-fetch";

import { consoleVersionHeaders } from "../version/api";
import { components, paths } from "./schemas/sync-server";

export type Organization = components["schemas"]["Organization"];
export type Invoice = components["schemas"]["Invoice"];

export const currentOrganization = (
  syncServerUrl: string,
  accessToken: string
) => {
  const fetcher = Fetcher.for<paths>();
  fetcher.configure({
    baseUrl: syncServerUrl,
    init: {
      headers: {
        ...consoleVersionHeaders(),
        authorization: `Bearer ${accessToken}`,
      },
    },
  });

  return fetcher.path("/api/organization").method("get").create()({});
};

export const recentInvoices = (syncServerUrl: string, accessToken: string) => {
  const fetcher = Fetcher.for<paths>();
  fetcher.configure({
    baseUrl: syncServerUrl,
    init: {
      headers: {
        ...consoleVersionHeaders(),
        authorization: `Bearer ${accessToken}`,
      },
    },
  });

  return fetcher.path("/api/invoices").method("get").create()({});
};
