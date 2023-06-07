import React from "react";
import { Route } from "react-router-dom";

import { SentryRoutes } from "~/sentry";

import Shell from "./Shell";

const ShellRoutes = () => (
  <SentryRoutes>
    <Route path="/" element={<Shell />} />
  </SentryRoutes>
);

export default ShellRoutes;
