/**
 * @module
 * Entry point for the frontend.
 */
import "@fontsource/inter/variable-full.css";
import "@fontsource/roboto-mono";
import "~/types";

import {
  ColorModeProvider,
  ColorModeScript,
  CSSReset,
  EnvironmentProvider,
  GlobalStyle,
  ThemeProvider,
  useColorMode,
} from "@chakra-ui/react";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import { LDProvider } from "launchdarkly-react-client-sdk";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { RecoilEnv, RecoilRoot } from "recoil";

import StatusPageWidget from "~/components/StatusPageWidget";
import config from "~/config";
import FronteggProviderWrapper from "~/FronteggProviderWrapper";
import Router from "~/router";
import {
  config as themeConfig,
  darkTheme,
  initialColorMode,
  lightTheme,
} from "~/theme";

import ErrorBox from "./components/ErrorBox";

RecoilEnv.RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED = false;

// Configure Sentry error reporting.
if (config.sentryDsn && config.sentryEnvironment && config.sentryRelease) {
  Sentry.init({
    dsn: config.sentryDsn,
    environment: config.sentryEnvironment,
    release: config.sentryRelease,
    integrations: [new BrowserTracing()],
  });
}

const rootEl = document.createElement("div");
document.body.appendChild(rootEl);

const root = createRoot(rootEl);

const ChakraProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  const mode = useColorMode();
  const theme = mode.colorMode === "dark" ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <CSSReset />
      <EnvironmentProvider>{children}</EnvironmentProvider>
    </ThemeProvider>
  );
};

root.render(
  <LDProvider
    clientSideID={config.launchDarklyKey}
    reactOptions={{
      useCamelCaseFlagKeys: false,
    }}
  >
    <ColorModeScript initialColorMode={initialColorMode} />
    <BrowserRouter>
      <ColorModeProvider options={themeConfig}>
        <ChakraProviderWrapper>
          <Sentry.ErrorBoundary fallback={<ErrorBox h="100vh" />}>
            <FronteggProviderWrapper baseUrl={config.fronteggUrl}>
              <RecoilRoot>
                <Router />
              </RecoilRoot>
            </FronteggProviderWrapper>
          </Sentry.ErrorBoundary>
        </ChakraProviderWrapper>
      </ColorModeProvider>
    </BrowserRouter>
    <StatusPageWidget id={config.statuspageId} />
  </LDProvider>
);
