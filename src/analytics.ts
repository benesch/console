import Analytics from "@segment/analytics.js-core/build/analytics";
import SegmentIntegration from "@segment/analytics.js-integration-segmentio";
import React, { useEffect } from "react";
import { useLocation } from "react-router";

import { GlobalConfig } from "./types";

/**
 * build an analytics client from config
 * @param apiKey the segment public api key
 */
export const buildAnalyticsClient = (apiKey: string) => {
  const analytics = new Analytics();
  analytics.use(SegmentIntegration);
  analytics.initialize({
    "Segment.io": {
      apiKey,
      retryQueue: true,
      addBundledMetadata: true,
    },
  });
  analytics.page();
  return analytics;
};

/**
 * init the analytics
 */
export const initAnalytics = (config: GlobalConfig) => {
  if (config.segmentApiKey) {
    analyticsClient = buildAnalyticsClient(config.segmentApiKey);
  }
};

/** A react component that will emit a page event on location change */
export const AnalyticsOnEveryPage: React.FC<{ analytics?: Analytics }> = ({
  analytics,
}) => {
  const location = useLocation();
  useEffect(() => {
    analytics?.page();
  }, [location]);

  return null;
};

/** a singleton instance of the analytics client */
export let analyticsClient: Analytics | undefined;
