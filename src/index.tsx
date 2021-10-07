/**
 * @module
 * Entry point for the frontend.
 */

import "@fontsource/inter/variable-full.css";
import "./types";

import { ChakraProvider } from "@chakra-ui/react";
import { FronteggProvider } from "@frontegg/react";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import logo from "../img/wordmark.svg";
import { RestfulProvider } from "./api/auth";
import { Router } from "./router";
import * as theme from "./theme";

/** global config injected from the django template */
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
        <RestfulProvider>
          <Router />
        </RestfulProvider>
      </FronteggProvider>
    </ChakraProvider>
  </BrowserRouter>,
  root
);
