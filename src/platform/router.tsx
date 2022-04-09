import React from "react";
import { Redirect, Route, Switch, useRouteMatch } from "react-router-dom";

import { useAuth } from "../api/auth";
import ClustersListPage from "./clusters/ClustersList";
import Dashboard from "./dashboard/Dashboard";
import EnvironmentsListPage from "./environments/EnvironmentsList";

const PlatformRouter = () => {
  const { path } = useRouteMatch();
  const { platformEnabled } = useAuth();

  if (!platformEnabled) {
    return <Redirect to="/" />;
  }

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <Dashboard />
      </Route>
      <Route path={`${path}/regions`}>
        <EnvironmentsListPage />
      </Route>
      <Route path={`${path}/clusters`}>
        <ClustersListPage />
      </Route>
    </Switch>
  );
};

export default PlatformRouter;
