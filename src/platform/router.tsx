import React from "react";
import { Redirect, Route, Switch, useRouteMatch } from "react-router-dom";

import { useAuth } from "../api/auth";
import ClustersListPage from "./ClustersList";
import Dashboard from "./dashboard/Dashboard";
import SinksListPage from "./SinksList";
import SourcesListPage from "./SourcesList";
import ViewsListPage from "./ViewsList";

const PlatformRouter = () => {
  const { path } = useRouteMatch();
  const { organization } = useAuth();

  if (!organization.platformEnabled) {
    return <Redirect to="/" />;
  }

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <Dashboard />
      </Route>
      <Route path={`${path}/clusters`}>
        <ClustersListPage />
      </Route>
      <Route path={`${path}/sources`}>
        <SourcesListPage />
      </Route>
      <Route path={`${path}/views`}>
        <ViewsListPage />
      </Route>
      <Route path={`${path}/sinks`}>
        <SinksListPage />
      </Route>
    </Switch>
  );
};

export default PlatformRouter;
