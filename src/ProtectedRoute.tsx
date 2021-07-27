import React from "react";
import { Route, RouteProps, useHistory } from "react-router-dom";

import { useAuth } from "@frontegg/react";

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
      loginRedirectUrl += `?redirectUrl=${encodeURIComponent(props.path)}`;
    }
    history.push(loginRedirectUrl);
    return null;
  }
}

export default ProtectedRoute;
