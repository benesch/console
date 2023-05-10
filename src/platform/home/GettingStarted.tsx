import React from "react";
import { Navigate, Route } from "react-router-dom";

import segment from "~/analytics/segment";
import InlayBanner from "~/components/InlayBanner";
import { useRegionSlug } from "~/region";
import { SentryRoutes } from "~/sentry";

const handleGettingStartedClick = () => {
  segment.track("Get Started Clicked", {});
};

const GettingStarted = () => {
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
        onClick: handleGettingStartedClick,
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
