/**
 * @module
 * Entry point for the frontend.
 */
import "@fontsource/inter/variable-full.css";
import "@fontsource/roboto-mono";
import "~/types";
// Initializes Sentry error reporting and tracing
import "~/sentry";
import "core-js/stable";

import {
  ColorModeProvider,
  ColorModeScript,
  CSSReset,
  EnvironmentProvider,
  GlobalStyle,
  ThemeProvider,
  ToastProvider,
  useColorMode,
} from "@chakra-ui/react";
import * as Sentry from "@sentry/react";
import { LDProvider } from "launchdarkly-react-client-sdk";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { RecoilEnv, RecoilRoot } from "recoil";

import ErrorBox from "~/components/ErrorBox";
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

RecoilEnv.RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED = false;

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
      <EnvironmentProvider>
        {children}
        <ToastProvider />
      </EnvironmentProvider>
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
