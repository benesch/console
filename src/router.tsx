/**
 * @module
 * URL routing.
 */

import { useAuth } from "@frontegg/react";
import React from "react";
import {
  Redirect,
  Route,
  RouteProps,
  Switch,
  useHistory,
} from "react-router-dom";

import { DeploymentDetailPage } from "./deployments/detail";
import { DeploymentListPage } from "./deployments/list";

/** The root router for the application. */
export function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/deployments/:id">
        <DeploymentDetailPage />
      </ProtectedRoute>
      <ProtectedRoute path="/deployments">
        <DeploymentListPage />
      </ProtectedRoute>
      <RedirectIfNotAuthRoute />
    </Switch>
  );
}

function RedirectIfNotAuthRoute() {
  const history = useHistory();
  const { routes: authRoutes } = useAuth();
  if (Object.values(authRoutes).includes(history.location.pathname)) {
    // Suppress the redirect to give Frontegg time to notice that it is
    // responsible for handling the URL. Otherwise we get stuck in a redirect
    // loop.
    //
    // NOTE(benesch): I've filed this bug upstream via our shared Slack channel.
    return null;
  } else {
    return <Redirect to={authRoutes.authenticatedUrl} />;
  }
}

function ProtectedRoute(props: RouteProps) {
  const history = useHistory();
  const { isAuthenticated, isLoading, routes: authRoutes } = useAuth();
  if (isLoading) {
    // Wait for authentication state to load before determining what to do.
    return null;
  } else if (isAuthenticated) {
    return <Route {...props} />;
  } else {
    let loginRedirectUrl = authRoutes.loginUrl;
    if (typeof props.path === "string") {
      loginRedirectUrl += `?redirectUrl=${encodeURIComponent(
        history.location.pathname
      )}`;
    }
    history.push(loginRedirectUrl);
    return null;
  }
}
