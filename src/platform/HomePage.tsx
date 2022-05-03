import React from "react";
import { Redirect } from "react-router-dom";

import { useAuth } from "../api/auth";

const HomePage = () => {
  const { platformEnabled } = useAuth();
  return platformEnabled ? (
    <Redirect to="/platform" />
  ) : (
    <Redirect to="/deployments" />
  );
};

export default HomePage;
