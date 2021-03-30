import "semantic-ui-css/semantic.min.css";
import "./index.css";

import React from "react";
import ReactDOM from "react-dom";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import App from "./App";
import { UserProvider } from "./auth/AuthContext";
import config from "./config";

if (config.sentryDsn) {
  Sentry.init({
    dsn: config.sentryDsn,
    environment: config.sentryEnvironment,
    release: config.sentryRelease,
    integrations: [new Integrations.BrowserTracing()],
  });
}

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
