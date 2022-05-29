import React from "react";
import { Redirect, Route, Switch, useRouteMatch } from "react-router-dom";

import { useAuth } from "../api/auth";
import Dashboard from "./dashboard/Dashboard";
import Home from "./home/Home";

const PlatformRouter = () => {
  const { path } = useRouteMatch();
  const { platformEnabled } = useAuth();

  if (!platformEnabled) {
    return <Redirect to="/" />;
  }

  return (
    <Switch>
      <Route exact path={`${path}`}>
        {/* <Dashboard /> */}
        <Home />
      </Route>
    </Switch>
  );
};

export default PlatformRouter;
