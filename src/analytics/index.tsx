import { GAAnalyticsClient } from "./googleAnalytics";
import { SegmentAnalyticsClient } from "./segment";

export const analyticsClients = [
  new GAAnalyticsClient(window.CONFIG),
  new SegmentAnalyticsClient(window.CONFIG),
];
