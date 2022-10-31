/**
 * @module
 * URL routing.
 */

import { useAuth as useFronteggAuth } from "@frontegg/react";
import React from "react";
import {
  Redirect,
  Route,
  Switch,
  SwitchProps,
  useLocation,
} from "react-router-dom";

import AppPasswordsPage from "./access/AppPasswordsPage";
import CLI from "./access/cli";
import PricingPage from "./access/PricingPage";
import AnalyticsOnEveryPage from "./analytics/AnalyticsOnEveryPage";
import { AuthProvider } from "./api/auth";
import { useOrganizationsRetrieve } from "./api/backend";
import config from "./config";
import { BaseLayout } from "./layouts/BaseLayout";
import ClustersListPage from "./platform/clusters/ClustersList";
import Editor from "./platform/editor/Editor";
import Home from "./platform/home/Home";
import { assert } from "./util";

/** The root router for the application. */
const Router = () => {
  return (
    <>
      <ProtectedSwitch>
        <Route path="/access/cli">
          <CLI />
        </Route>
        <Route path="/access">
          <AppPasswordsPage />
        </Route>
        <Route path="/pricing">
          <PricingPage />
        </Route>
        <Route path="/clusters">
          <ClustersListPage />
        </Route>
        <Route path="/editor">
          <Editor />
        </Route>
        <Route path="/" exact>
          <RedirectToHome />
        </Route>
        <Route>
          <Redirect to="/" />
        </Route>
      </ProtectedSwitch>
      <AnalyticsOnEveryPage config={config} />
    </>
  );
};

const RedirectToHome = () => {
  const location = useLocation();
  const { routes: authRoutes } = useFronteggAuth((state) => state);
  if (
    location.pathname !== authRoutes.authenticatedUrl &&
    Object.values(authRoutes).includes(location.pathname)
  ) {
    // If this is an authentication route, it's Frontegg's responsibility to
    // handle it. Return null rather than redirecting so Frontegg has time to
    // notice it.
    return null;
  } else {
    return <Home />;
  }
};

const ProtectedSwitch = (props: SwitchProps) => {
  const location = useLocation();
  const layoutOverflow = location.pathname === "/editor" ? "hidden" : "auto";
  // Consume Frontegg authentication state.
  const {
    isAuthenticated,
    isLoading: isFronteggLoading,
    routes: authRoutes,
    user,
  } = useFronteggAuth((state) => state);

  // Load Materialize Cloud's metadata about the authenticated organization.
  const { data: organization, loading: isOrganizationLoading } =
    useOrganizationsRetrieve({
      // Only fetch the organization metadata if we have a valid access token...
      lazy: !isAuthenticated,
      // ...but we still need to invent a non-null organization ID if we
      // haven't authenticated yet to keep TypeScript happy.
      id: user?.tenantId || "",
    });

  const isLoading = isFronteggLoading || isOrganizationLoading;

  // Wait for authentication state to load before determining what to do.
  if (isLoading) {
    return null;
  }

  if (location.pathname.startsWith("/account")) {
    // Paths that start with /account are handled by Frontegg, but for reasons
    // that are not fully understood, our router is rendered before Frontegg's.
    // Return `null` so that we don't issue a redirect before Frontegg's router
    // kicks in. This prevents redirect loops on sign in (#3413) and broken
    // logouts (#4351).
    return null;
  }

  // If unauthenticated, redirect to login page, remembering what page the user
  // was trying to access.
  if (!isAuthenticated) {
    const redirectUrl = encodeURIComponent(location.pathname);
    const loginUrl = `${authRoutes.loginUrl}?redirectUrl=${redirectUrl}`;
    return <Redirect to={loginUrl} />;
  }

  // If we're here, `isLoading` is `false` and `isAuthenticated` is true, which
  // guarantees that `user` and `organization` are non-null. TypeScript can't
  // infer this, so help it along.
  assert(organization);
  assert(user);

  // Render the switch.
  return (
    <AuthProvider organization={organization} user={user}>
      <BaseLayout overflowY={layoutOverflow}>
        <Switch {...props} />
      </BaseLayout>
    </AuthProvider>
  );
};

export default Router;
