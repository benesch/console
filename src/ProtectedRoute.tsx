import React from "react";
import { Redirect, Route } from "react-router-dom";

import { AuthStatus, useAuth } from "./auth/AuthProvider";

function ProtectedRoute(props: any) {
  const auth = useAuth();

  switch (auth.state.status) {
    case AuthStatus.LoggedIn:
      return <Route {...props} />;
    case AuthStatus.LoggedOut:
      return <Redirect to="/login" />;
    case AuthStatus.Loading:
      // If the auth status is loading, just render nothing. The status will
      // eventually update to `LoggedIn` or `LoggedOut`.
      //
      // TODO(benesch): we ought to display a loading indicator.
      return null;
  }
}

export default ProtectedRoute;
