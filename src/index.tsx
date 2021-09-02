import "semantic-ui/semantic.less";
import "./index.css";

import React from "react";
import ReactDOM from "react-dom";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import Router from "./Router";
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
  <React.StrictMode>
    <FronteggProvider
      contextOptions={{ baseUrl: config.fronteggUrl }}
      authOptions={{
        routes: {
          authenticatedUrl: "/deployments",
          // These URLs need to be specified due to a missing default in frontegg.
          // TODO: remove when upgraded to frontegg 3.0.2+
          loginUrl: "/account/login",
          logoutUrl: "/account/logout",
          activateUrl: "/account/activate",
          acceptInvitationUrl: "/account/invitation/accept",
          forgetPasswordUrl: "/account/forget-password",
          resetPasswordUrl: "/account/reset-password",
          signUpUrl: "/account/sign-up",
        },
      }}
      headerImage={logo}
    >
      <AuthedFetchProvider>
        <Router />
      </AuthedFetchProvider>
    </FronteggProvider>
  </React.StrictMode>,
  root
);
