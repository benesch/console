import { EnvironmentProvider, ToastProvider } from "@chakra-ui/react";
import { ThemeProvider } from "@emotion/react";
import { render } from "@testing-library/react";
import React, { ReactElement } from "react";
import {
  BrowserRouter,
  MemoryRouter,
  Route,
  useLocation,
} from "react-router-dom";
import { MutableSnapshot, RecoilRoot, SetRecoilState } from "recoil";

import {
  currentEnvironmentIdState,
  environmentsWithHealth,
  LoadedEnvironment,
} from "~/recoil/environments";
import { SentryRoutes } from "~/sentry";
import { lightTheme } from "~/theme";
import { parseDbVersion } from "~/version/api";

export const healthyEnvironment: LoadedEnvironment = {
  environmentdPgwireAddress:
    "8zpze6ltqnsjok9vvf2i99st5.us-east-1.aws.example.com:6875",
  environmentdHttpsAddress:
    "8zpze6ltqnsjok9vvf2i99st5.us-east-1.aws.example.com:443",
  resolvable: true,
  creationTimestamp: "2023-01-10T01:59:37Z",
  state: "enabled",
  status: { health: "healthy", version: parseDbVersion("v0.99.0 (ea0d129f)") },
};

export const RenderWithPathname = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const current = useLocation();
  return (
    <>
      {children}
      <div data-testid="pathname">{current.pathname}</div>
    </>
  );
};

export const setFakeEnvironment = (
  set: SetRecoilState,
  regionId: string,
  environment: LoadedEnvironment
) => {
  const environments = new Map<string, LoadedEnvironment>([
    [regionId, environment],
  ] as const);
  set(currentEnvironmentIdState, regionId);
  set(environmentsWithHealth, environments);
};

export type InitializeStateFn = (mutableSnapshot: MutableSnapshot) => void;

/**
 * Renders a component with all our app providers
 */
export const renderComponent = (
  element: ReactElement,
  options: {
    initializeState?: InitializeStateFn;
    initialRouterEntries?: string[];
  } = {}
) => {
  return render(
    <ProviderWrapper
      initializeState={options.initializeState}
      initialRouterEntries={options.initialRouterEntries}
    >
      {element}
    </ProviderWrapper>
  );
};

export interface ProviderWrapperProps {
  initializeState?: InitializeStateFn;
  initialRouterEntries?: string[];
}

/**
 * Factory function to create a ProviderWrapper with initial recoil state and router entries for use with renderHook.
 * This wrapper includes a BrowserRouter rather than a MemoryRouter.
 */
export const createProviderWrapper = ({
  initializeState,
}: React.PropsWithChildren<ProviderWrapperProps>) => {
  return function ({ children }: React.PropsWithChildren) {
    return (
      <RecoilRoot initializeState={initializeState}>
        <ThemeProvider theme={lightTheme}>
          <EnvironmentProvider>
            <React.Suspense fallback="suspense-fallback">
              <BrowserRouter>
                <SentryRoutes>
                  <Route path="/*" element={children} />
                </SentryRoutes>
              </BrowserRouter>
            </React.Suspense>
            <ToastProvider />
          </EnvironmentProvider>
        </ThemeProvider>
      </RecoilRoot>
    );
  };
};

/**
 * Test component with all the necessary providers for our various hooks.
 */
export const ProviderWrapper = ({
  children,
  initializeState,
  initialRouterEntries,
}: React.PropsWithChildren<ProviderWrapperProps>) => {
  return (
    <RecoilRoot initializeState={initializeState}>
      <ThemeProvider theme={lightTheme}>
        <EnvironmentProvider>
          <React.Suspense fallback="suspense-fallback">
            <MemoryRouter initialEntries={initialRouterEntries}>
              <SentryRoutes>
                <Route path="/*" element={children} />
              </SentryRoutes>
            </MemoryRouter>
          </React.Suspense>
          <ToastProvider />
        </EnvironmentProvider>
      </ThemeProvider>
    </RecoilRoot>
  );
};
