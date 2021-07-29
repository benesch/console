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
import { newTracker, trackPageView } from "@snowplow/browser-tracker";
import { PerformanceTimingPlugin } from "@snowplow/browser-plugin-performance-timing";
import {
  FormTrackingPlugin,
  enableFormTracking,
} from "@snowplow/browser-plugin-form-tracking";
import { Auth } from "@aws-amplify/auth";

if (config.sentryDsn) {
  Sentry.init({
    dsn: config.sentryDsn,
    environment: config.sentryEnvironment,
    release: config.sentryRelease,
    integrations: [new Integrations.BrowserTracing()],
  });
}

// Snowplow configuration.
newTracker("cg", "https://sp.materialize.com", {
  appId: "materialize",
  plugins: [PerformanceTimingPlugin(), FormTrackingPlugin()],
});
trackPageView();
enableFormTracking();

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
