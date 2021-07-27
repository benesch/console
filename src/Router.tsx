import React from "react";
import { Redirect, Switch, useHistory } from "react-router-dom";

import Deployments from "./Deployments";
import ProtectedRoute from "./ProtectedRoute";
import LoggedInLayout from "./LoggedInLayout";
import { useAuth } from "@frontegg/react";

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

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/deployments">
        <LoggedInLayout>
          <Deployments />
        </LoggedInLayout>
      </ProtectedRoute>
      <RedirectIfNotAuthRoute />
    </Switch>
  );
}

export default Router;
