import "semantic-ui/semantic.less";
import "./index.css";

import React from "react";
import ReactDOM from "react-dom";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import Router from "./Router";
import { BrowserRouter } from "react-router-dom";
import { AuthedFetchProvider } from "./AuthedFetchProvider";
import config from "./config";
import Analytics from "@segment/analytics.js-core/build/analytics";
import SegmentIntegration from "@segment/analytics.js-integration-segmentio";
import { FronteggProvider } from "@frontegg/react";
import logo from "./img/logo-primary.png";

// Configure Sentry error reporting.
if (config.sentryDsn && config.sentryEnvironment && config.sentryRelease) {
  Sentry.init({
    dsn: config.sentryDsn,
    environment: config.sentryEnvironment,
    release: config.sentryRelease,
    integrations: [new Integrations.BrowserTracing()],
  });
}

// Configure Segment analytics.
if (config.segmentApiKey) {
  const analytics = new Analytics();
  analytics.use(SegmentIntegration);
  analytics.initialize({
    "Segment.io": {
      apiKey: config.segmentApiKey,
      retryQueue: true,
      addBundledMetadata: true,
    },
  });
  analytics.page();
}

const root = document.createElement("div");
document.body.appendChild(root);

ReactDOM.render(
  <BrowserRouter>
    <FronteggProvider
      contextOptions={{ baseUrl: config.fronteggUrl }}
      authOptions={{
        routes: {
          authenticatedUrl: "/deployments",
        },
      }}
      headerImage={logo}
    >
      <AuthedFetchProvider>
        <Router />
      </AuthedFetchProvider>
    </FronteggProvider>
  </BrowserRouter>,
  root
);
