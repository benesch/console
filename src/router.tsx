/**
 * @module
 * URL routing.
 */

import { useAuth as useFronteggAuth } from "@frontegg/react";
import React from "react";
import {
  Redirect,
  Route,
  RouteProps,
  Switch,
  useLocation,
} from "react-router-dom";
import { useRecoilState } from "recoil";

import analyticsClients from "./analytics";
import AnalyticsOnEveryPage from "./analytics/AnalyticsOnEveryPage";
import { useOrganizationsRetrieve } from "./api/api";
import { AuthProvider } from "./api/auth";
import DeploymentDetailPage from "./deployments/detail/DetailPage";
import DeploymentListPage from "./deployments/ListPage";
import PlatformRouter from "./platform/router";
import platform from "./recoil/platform";
import { assert } from "./util";

/** The root router for the application. */
const Router = () => {
  const [isPlatform] = useRecoilState(platform);
  return (
    <>
      <Switch>
        <ProtectedRoute path="/deployments/:id">
          <DeploymentDetailPage />
        </ProtectedRoute>
        <ProtectedRoute path="/deployments">
          <DeploymentListPage />
        </ProtectedRoute>
        {isPlatform && (
          <ProtectedRoute path="/platform">
            <PlatformRouter />
          </ProtectedRoute>
        )}
        <RedirectIfNotAuthRoute />
      </Switch>
      <AnalyticsOnEveryPage clients={analyticsClients} />
    </>
  );
};

const RedirectIfNotAuthRoute = () => {
  const location = useLocation();
  const { routes: authRoutes } = useFronteggAuth((state) => state);
  if (Object.values(authRoutes).includes(location.pathname)) {
    // Suppress the redirect to give Frontegg time to notice that it is
    // responsible for handling the URL. Otherwise we get stuck in a redirect
    // loop.
    //
    // NOTE(benesch): I've filed this bug upstream via our shared Slack channel.
    return null;
  } else {
    return <Redirect to={authRoutes.authenticatedUrl} />;
  }
};

type ProtectedRouteProps = RouteProps;

const ProtectedRoute = (props: ProtectedRouteProps) => {
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

  //
  return (
    <AuthProvider organization={organization} user={user}>
      <Route {...props} />
    </AuthProvider>
  );
};

export default Router;
