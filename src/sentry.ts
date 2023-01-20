import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import React from "react";
import {
  createRoutesFromChildren,
  matchRoutes,
  Routes,
  useLocation,
  useNavigationType,
} from "react-router-dom";

import config from "~/config";

// We have to initialize Sentry before calling withSentryReactRouterV6Routing
// which prevents us from putting this in a function.
if (config.sentryDsn && config.sentryEnvironment && config.sentryRelease) {
  Sentry.init({
    dsn: config.sentryDsn,
    environment: config.sentryEnvironment,
    release: config.sentryRelease,
    integrations: [
      new BrowserTracing({
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          React.useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
      }),
    ],
    tracesSampleRate: 1.0,
  });
}

/** React router <Routes /> component wrapped with Sentry tracing */
export const SentryRoutes = Sentry.withSentryReactRouterV6Routing(Routes);
