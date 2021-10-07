import React from "react";
import { useEffect } from "react";
import { useLocation } from "react-router";

import { GAAnalyticsClient } from "./googleAnalytics";
import { SegmentAnalyticsClient } from "./segment";
import { AnalyticsClient } from "./types";

/**
 * A react component that will emit analytics page event on location change
 * for all provided analytics clients.
 * @param analyticsClients - An array of analytics clients.
 * @returns A react component.
 */
export const AnalyticsOnEveryPage: React.FC<{ clients: AnalyticsClient[] }> = ({
  clients,
}) => {
  const location = useLocation();
  useEffect(() => {
    clients.forEach((client) => {
      client.page();
    });
  }, [location]);

  return null;
};

export const analyticsClients = [
  new GAAnalyticsClient(window.CONFIG),
  new SegmentAnalyticsClient(window.CONFIG),
];
