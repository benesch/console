import { useAuth } from "@frontegg/react";
import React from "react";
import { useLocation } from "react-router";

import segment from "~/analytics/segment";

/**
 * Component that will emit analytics page event on location change.
 */
const AnalyticsOnEveryPage = () => {
  const auth = useAuth((state) => state);
  const location = useLocation();

  React.useEffect(() => {
    segment.page();
  }, [location]);

  // once we have valid auth, identify the further analytics events
  // otherwise, logout
  React.useEffect(() => {
    if (auth.user) {
      const u = auth.user;
      segment.identify(u.id);
    } else {
      segment.reset();
    }
  }, [auth]);
  return null;
};

export default AnalyticsOnEveryPage;
