import { FronteggProvider } from "@frontegg/react";
import Analytics from "@segment/analytics.js-core/build/analytics";
import SegmentIntegration from "@segment/analytics.js-integration-segmentio";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import logo from "../img/logo-primary.png";
import { AuthedFetchProvider } from "./api/fetch";
import { Router } from "./router";

/** Required configuration properties for the frontend. */
interface Config {
  fronteggUrl: string;
  segmentApiKey: string | null;
  sentryDsn: string | null;
  sentryEnvironment: string | null;
  sentryRelease: string | null;
}

const config = (globalThis as any).CONFIG as Config;

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
