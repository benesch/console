/**
 * @module
 * Entry point for the frontend.
 */

import "@fontsource/inter/variable-full.css";

import { ChakraProvider } from "@chakra-ui/react";
import { FronteggProvider } from "@frontegg/react";
import Analytics from "@segment/analytics.js-core/build/analytics";
import SegmentIntegration from "@segment/analytics.js-integration-segmentio";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import logo from "../img/wordmark.svg";
import { AuthedFetchProvider } from "./api/fetch";
import { Router } from "./router";
import * as theme from "./theme";

/**
 * Required configuration properties for the frontend.
 *
 * These are set by the backend on `window.CONFIG`.
 */
interface Config {
  fronteggUrl: string;
  segmentApiKey: string | null;
  sentryDsn: string | null;
  sentryEnvironment: string | null;
  sentryRelease: string | null;
}

export const config = (globalThis as any).CONFIG as Config;

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
    <ChakraProvider theme={theme.chakraTheme}>
      <FronteggProvider
        contextOptions={{ baseUrl: config.fronteggUrl }}
        authOptions={{
          routes: {
            authenticatedUrl: "/deployments",
          },
        }}
        headerImage={logo}
        backgroundImage={theme.fronteggAuthPageBackground}
        themeOptions={theme.fronteggTheme}
        customStyles={theme.fronteggCustomStyles}
      >
        <AuthedFetchProvider>
          <Router />
        </AuthedFetchProvider>
      </FronteggProvider>
    </ChakraProvider>
  </BrowserRouter>,
  root
);
