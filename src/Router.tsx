import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

import Deployments from "./Deployments";
import AuthLayout from "./auth/AuthLayout";
import ForgotPassword from "./auth/ForgotPassword";
import Login from "./auth/Login";
import SignUp from "./auth/SignUp";
import NewPassword from "./auth/NewPassword";
import ProtectedRoute from "./ProtectedRoute";
import LoggedInLayout from "./LoggedInLayout";

function Router() {
  return (
    <Switch>
      <Route path="/login">
        <AuthLayout>
          <Login />
        </AuthLayout>
      </Route>
      <Route path="/signup">
        <AuthLayout>
          <SignUp />
        </AuthLayout>
      </Route>
      <Route path="/forgot-password">
        <AuthLayout>
          <ForgotPassword />
        </AuthLayout>
      </Route>
      <ProtectedRoute path="/deployments">
        <LoggedInLayout>
          <Deployments />
        </LoggedInLayout>
      </ProtectedRoute>
      <Route path="/new-password">
        <NewPassword />
      </Route>
      <Route>
        <Redirect to="/deployments" />
      </Route>
    </Switch>
  );
}

export default Router;
