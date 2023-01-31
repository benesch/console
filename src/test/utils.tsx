import { ThemeProvider } from "@emotion/react";
import { render } from "@testing-library/react";
import React, { ReactElement } from "react";
import { MemoryRouter, Route } from "react-router-dom";
import { MutableSnapshot, RecoilRoot, SetRecoilState } from "recoil";

import {
  currentEnvironmentIdState,
  environmentsWithHealth,
  LoadedEnvironment,
} from "~/recoil/environments";
import { SentryRoutes } from "~/sentry";
import { lightTheme } from "~/theme";

export const healthyEnvironment: LoadedEnvironment = {
  environmentdPgwireAddress:
    "8zpze6ltqnsjok9vvf2i99st5.us-east-1.aws.example.com:6875",
  environmentdHttpsAddress:
    "8zpze6ltqnsjok9vvf2i99st5.us-east-1.aws.example.com:443",
  resolvable: true,
  creationTimestamp: "2023-01-10T01:59:37Z",
  state: "enabled",
  health: "healthy",
  errors: [],
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

export const renderComponent = (
  element: ReactElement,
  initializeState?: InitializeStateFn,
  initialRouterEntries?: string[]
) => {
  return render(
    <RecoilRoot initializeState={initializeState}>
      <ThemeProvider theme={lightTheme}>
        <React.Suspense fallback="suspense-fallback">
          <MemoryRouter initialEntries={initialRouterEntries}>
            <SentryRoutes>
              <Route path="/*" element={element} />
            </SentryRoutes>
          </MemoryRouter>
        </React.Suspense>
      </ThemeProvider>
    </RecoilRoot>
  );
};
