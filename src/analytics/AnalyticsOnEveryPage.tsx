import { useAuth } from "@frontegg/react";
import { useEffect } from "react";
import { useLocation } from "react-router";

import { GlobalConfig } from "../config";
import useAnalyticsClients from "./hook";
import { AnalyticsClient } from "./types";

/**
 * A react component that will emit analytics page event on location change
 * for all provided analytics clients.
 * @returns A react component.
 */
const AnalyticsOnEveryPage: React.FC<{
  config?: GlobalConfig;
  clients?: AnalyticsClient[];
}> = ({ config, clients }) => {
  const auth = useAuth((state) => state);
  const allClients = useAnalyticsClients({ config, clients });
  const location = useLocation();

  useEffect(() => {
    allClients.forEach((client) => {
      client.page();
    });
  }, [location]);

  // once we have valid auth, identify the further analytics events
  // otherwise, logout
  useEffect(() => {
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
  }, [auth]);
  return null;
};

export default AnalyticsOnEveryPage;
