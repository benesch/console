import React from "react";
import { Navigate, Route } from "react-router-dom";

import segment from "~/analytics/segment";
import { CopyableBox } from "~/components/copyableComponents";
import InlayBanner from "~/components/InlayBanner";
import { useRegionSlug } from "~/region";
import { SentryRoutes } from "~/sentry";

// These credentials are read only and not considered sensitive
const secrets = `CREATE SECRET kafka_user AS 'CL6M5VSYI32TVILA';
CREATE SECRET kafka_password AS 'swK5gpo9J3uJKaeeHjTkKXnU7qd5Gp90FDJq4CbHKvNnU4kl7uQ1jzVIGsvhHB0K';
CREATE SECRET csr_user AS 'DISCU3R3EBELNOZQ';
CREATE SECRET csr_password AS 'pQwNVqWdGs8P4VUpdYYoHfnpc0B1lqXTmZKD+U3O/yh+vMrAj4jDwTAbHuzSlkei';`;

const handleGettingStartedClick = () => {
  segment.track("Get Started Clicked", {});
};

const handleCopyClick = () => {
  segment.track("Demo Credentials Copied", {});
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
        <Route path="showSourceCredentials" element={<CopyableCredentials />} />
        <Route path="" />
        <Route
          path="*"
          element={<Navigate to={`/regions/${regionSlug}/`} replace />}
        />
      </SentryRoutes>
    </InlayBanner>
  );
};

const CopyableCredentials = () => {
  return (
    <CopyableBox
      variant="embedded"
      contents={secrets}
      onClick={handleCopyClick}
    >
      {secrets}
    </CopyableBox>
  );
};

export default GettingStarted;
