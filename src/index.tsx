import "semantic-ui/semantic.less";
import "./index.css";

import React from "react";
import ReactDOM from "react-dom";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { BrowserRouter } from "react-router-dom";
import Router from "./Router";
import { AuthProvider } from "./auth/AuthProvider";
import config from "./config";
import Analytics from "@segment/analytics.js-core/build/analytics";
import SegmentIntegration from "@segment/analytics.js-integration-segmentio";
import { Auth } from "@aws-amplify/auth";

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

// AWS Cognito configuration.
Auth.configure({
  region: config.cognitoRegion,
  userPoolId: config.cognitoUserPoolId,
  userPoolWebClientId: config.cognitoWebClientId,
});

const root = document.createElement("div");
document.body.appendChild(root);

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
  root
);
