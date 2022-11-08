/**
 * @module
 * Entry point for the frontend.
 */
import "@fontsource/inter/variable-full.css";
import "./types";

import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";

import StatusPageWidget from "./components/StatusPageWidget";
import config from "./config";
import FronteggProviderWrapper from "./FronteggProviderWrapper";
import Router from "./router";
import * as theme from "./theme";

// Configure Sentry error reporting.
if (config.sentryDsn && config.sentryEnvironment && config.sentryRelease) {
  Sentry.init({
    dsn: config.sentryDsn,
    environment: config.sentryEnvironment,
    release: config.sentryRelease,
    integrations: [new Integrations.BrowserTracing()],
  });
}

const rootEl = document.createElement("div");
document.body.appendChild(rootEl);

const root = createRoot(rootEl);

root.render(
  <>
    <ColorModeScript
      initialColorMode={theme.chakraTheme.config.initialColorMode}
    />
    <BrowserRouter>
      <ChakraProvider theme={theme.chakraTheme}>
        <FronteggProviderWrapper baseUrl={config.fronteggUrl}>
          <RecoilRoot>
            <Router />
          </RecoilRoot>
        </FronteggProviderWrapper>
      </ChakraProvider>
    </BrowserRouter>
    <StatusPageWidget id={config.statuspageId} />
  </>
);
