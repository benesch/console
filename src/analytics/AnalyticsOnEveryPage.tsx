import { useAuth } from "@frontegg/react";
import React from "react";
import { useLocation } from "react-router";

import { GlobalConfig } from "../config";
import GAAnalyticsClient from "./googleAnalytics";
import SegmentAnalyticsClient from "./segment";
import { AnalyticsClient } from "./types";

/**
 * A react component that will emit analytics page event on location change
 * for all provided analytics clients.
 * @returns A react component.
 */
const AnalyticsOnEveryPage: React.FC<
  React.PropsWithChildren<{
    config: GlobalConfig;
    clients?: AnalyticsClient[];
  }>
> = ({ config, clients }) => {
  const auth = useAuth((state) => state);
  const location = useLocation();
  const allClients = React.useMemo(
    () =>
      clients ?? [
        new GAAnalyticsClient(config),
        new SegmentAnalyticsClient(config),
      ],
    [config, clients]
  );

  React.useEffect(() => {
    allClients.forEach((client) => {
      client.page();
    });
  }, [allClients, location]);

  // once we have valid auth, identify the further analytics events
  // otherwise, logout
  React.useEffect(() => {
    if (auth.user) {
      const u = auth.user;
      allClients.forEach((client) => {
        client.identify(u.id ?? "");
      });
    } else {
      allClients.forEach((client) => {
        client.reset();
      });
    }
  }, [allClients, auth]);
  return null;
};

export default AnalyticsOnEveryPage;
