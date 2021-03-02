import React from "react";
import { Redirect, Route } from "react-router-dom";

import { useUser } from "./auth/AuthContext";

function ProtectedRoute(props: any) {
  const { user, hasInitialized } = useUser();

  if (user) {
    return <Route {...props} />;
  } else if (hasInitialized) {
    return <Redirect to="/login" />;
  }
  return null;
}

export default ProtectedRoute;
