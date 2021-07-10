import "semantic-ui/semantic.less";
import "./index.css";

import React from "react";
import ReactDOM from "react-dom";
import * as Sentry from "@sentry/react";
import * as FullStory from "@fullstory/browser";
import { Integrations } from "@sentry/tracing";
import App from "./App";
import { UserProvider } from "./auth/AuthContext";
import config from "./config";
import { newTracker, trackPageView } from "@snowplow/browser-tracker";
import { PerformanceTimingPlugin } from "@snowplow/browser-plugin-performance-timing";
import {
  FormTrackingPlugin,
  enableFormTracking,
} from "@snowplow/browser-plugin-form-tracking";

if (config.sentryDsn) {
  Sentry.init({
    dsn: config.sentryDsn,
    environment: config.sentryEnvironment,
    release: config.sentryRelease,
    integrations: [new Integrations.BrowserTracing()],
  });
}

if (config.fullStoryOrgId) {
  FullStory.init({ orgId: config.fullStoryOrgId });
}

// Snowplow configuration.
newTracker("cg", "sp.materialize.com", {
  appId: "materialize",
  plugins: [PerformanceTimingPlugin(), FormTrackingPlugin()],
});
trackPageView();
enableFormTracking();

const root = document.createElement("div");
document.body.appendChild(root);

ReactDOM.render(
  <React.StrictMode>
    <UserProvider
      region={config.cognitoRegion}
      userPoolId={config.cognitoUserPoolId}
      userPoolWebClientId={config.cognitoWebClientId}
    >
      <App />
    </UserProvider>
  </React.StrictMode>,
  root
);
