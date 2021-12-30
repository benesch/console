import GAAnalyticsClient from "./googleAnalytics";
import SegmentAnalyticsClient from "./segment";

export default [
  new GAAnalyticsClient(window.CONFIG),
  new SegmentAnalyticsClient(window.CONFIG),
];
