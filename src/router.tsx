/**
 * @module
 * URL routing.
 */

import { useAuth as useFronteggAuth } from "@frontegg/react";
import React from "react";
import {
  Redirect,
  Route,
  Switch,
  SwitchProps,
  useLocation,
} from "react-router-dom";

import AppPasswordsPage from "./access/AppPasswordsPage";
import AnalyticsOnEveryPage from "./analytics/AnalyticsOnEveryPage";
import { AuthProvider } from "./api/auth";
import { useAuth } from "./api/auth";
import { useOrganizationsRetrieve } from "./api/backend";
import DeploymentDetailPage from "./deployments/detail/DetailPage";
import DeploymentListPage from "./deployments/ListPage";
import { BaseLayout } from "./layouts/BaseLayout";
import PlatformRouter from "./platform/router";
import { assert } from "./util";

/** The root router for the application. */
const Router = () => {
  const location = useLocation();
  const layoutOverflow =
    location.pathname === "/platform/editor" ? "scroll" : undefined;

  return (
    <>
      <ProtectedSwitch>
        <BaseLayout overflow={layoutOverflow}>
          <Route path="/deployments/:id">
            <DeploymentDetailPage />
          </Route>
          <Route path="/deployments" exact>
            <DeploymentListPage />
          </Route>
          <Route path="/access">
            <AppPasswordsPage />
          </Route>
          <Route path="/platform">
            <PlatformRouter />
          </Route>
          <Route path="/">
            <RedirectToHome />
          </Route>
        </BaseLayout>
      </ProtectedSwitch>
      <AnalyticsOnEveryPage config={window.CONFIG} />
    </>
  );
};

const RedirectToHome = () => {
  const location = useLocation();
  const { routes: authRoutes } = useFronteggAuth((state) => state);
  const { platformEnabled } = useAuth();
  if (
    location.pathname !== authRoutes.authenticatedUrl &&
    Object.values(authRoutes).includes(location.pathname)
  ) {
    // If this is an authentication route, it's Frontegg's responsibility to
    // handle it. Return null rather than redirecting so Frontegg has time to
    // notice it.
    return null;
  } else {
    return <Redirect to={platformEnabled ? "/platform" : "/deployments"} />;
  }
};

const ProtectedSwitch = (props: SwitchProps) => {
  const location = useLocation();

  // Consume Frontegg authentication state.
  const {
    isAuthenticated,
    isLoading: isFronteggLoading,
    routes: authRoutes,
    user,
  } = useFronteggAuth((state) => state);

  // Load Materialize Cloud's metadata about the authenticated organization.
  const { data: organization, loading: isOrganizationLoading } =
    useOrganizationsRetrieve({
      // Only fetch the organization metadata if we have a valid access token...
      lazy: !isAuthenticated,
      // ...but we still need to invent a non-null organization ID if we
      // haven't authenticated yet to keep TypeScript happy.
      id: user?.tenantId || "",
    });

  const isLoading = isFronteggLoading || isOrganizationLoading;

  // Wait for authentication state to load before determining what to do.
  if (isLoading) {
    return null;
  }

  // If unauthenticated, redirect to login page, remembering what page the user
  // was trying to access.
  if (!isAuthenticated) {
    const redirectUrl = encodeURIComponent(location.pathname);
    const loginUrl = `${authRoutes.loginUrl}?redirectUrl=${redirectUrl}`;
    return <Redirect to={loginUrl} />;
  }

  // If we're here, `isLoading` is `false` and `isAuthenticated` is true, which
  // guarantees that `user` and `organization` are non-null. TypeScript can't
  // infer this, so help it along.
  assert(organization);
  assert(user);

  // Render the switch.
  return (
    <AuthProvider organization={organization} user={user}>
      <Switch {...props} />
    </AuthProvider>
  );
};

export default Router;
