import React from "react";
import { Navigate, Route } from "react-router-dom";

import { useSegment } from "~/analytics/segment";
import InlayBanner from "~/components/InlayBanner";
import { useRegionSlug } from "~/region";
import { SentryRoutes } from "~/sentry";

const GettingStarted = () => {
  const { track } = useSegment();
  const regionSlug = useRegionSlug();

  return (
    <InlayBanner
      variant="info"
      label="Get started with Materialize"
      message="Learn the basics of Materialize by creating your first set of
              clusters, views, and sources."
      buttonText="Get started"
      buttonProps={{
        as: "a",
        target: "_blank",
        rel: "noopener",
        href: "//materialize.com/docs/get-started/",
        onClick: () => {
          track("Get Started Clicked");
        },
      }}
      showButton
    >
      <SentryRoutes>
        <Route path="" />
        <Route
          path="*"
          element={<Navigate to={`/regions/${regionSlug}/`} replace />}
        />
      </SentryRoutes>
    </InlayBanner>
  );
};

export default GettingStarted;
