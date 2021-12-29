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
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import FronteggWrappedContents from "./fronteggWrappedContents";
import * as theme from "./theme";

/** global config injected from the django template */
// eslint-disable-next-line import/prefer-default-export
export const config = window.CONFIG;
// Configure Sentry error reporting.
if (config.sentryDsn && config.sentryEnvironment && config.sentryRelease) {
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
  <>
    <ColorModeScript
      initialColorMode={theme.chakraTheme.config.initialColorMode}
    />
    <BrowserRouter>
      <ChakraProvider theme={theme.chakraTheme}>
        <FronteggWrappedContents baseUrl={config.fronteggUrl} />
      </ChakraProvider>
    </BrowserRouter>
  </>,
  root
);
