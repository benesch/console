/**
 * @module
 * URL routing.
 */

import { useAuth, useAuth as useFronteggAuth } from "@frontegg/react";
import { useLDClient } from "launchdarkly-react-client-sdk";
import React from "react";
import { Navigate, Route, RoutesProps, useLocation } from "react-router-dom";

import AppPasswordsPage from "~/access/AppPasswordsPage";
import CLI from "~/access/cli";
import PricingPage from "~/access/PricingPage";
import AnalyticsOnEveryPage from "~/analytics/AnalyticsOnEveryPage";
import { AuthProvider } from "~/api/auth";
import config from "~/config";
import { BaseLayout } from "~/layouts/BaseLayout";
import LoadingScreen from "~/loading";
import ClusterRoutes from "~/platform/clusters/clusterRouter";
import Editor from "~/platform/editor/Editor";
import Home from "~/platform/home/Home";
import SinkRoutes from "~/platform/sinks/SinkRoutes";
import SourceRoutes from "~/platform/sources/SourceRoutes";
import useSetEnvironment from "~/useSetEnvironment";
import { assert } from "~/util";

import { SentryRoutes } from ".";

/** The root router for the application. */
const Router = () => {
  useSetEnvironment();

  const ldClient = useLDClient();
  const { user } = useAuth();

  React.useEffect(() => {
    if (!ldClient || !user) return;

    ldClient.identify({
      key: user.id,
      email: user.email,
      custom: {
        orgId: user.tenantId,
      },
    });
  }, [ldClient, user]);

  return (
    <>
      <ProtectedRoutes>
        <Route path="/access/cli" element={<CLI />} />
        <Route path="/access" element={<AppPasswordsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/clusters/*" element={<ClusterRoutes />} />
        <Route path="/sources/*" element={<SourceRoutes />} />
        <Route path="/sinks/*" element={<SinkRoutes />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="*" element={<RedirectToHome />} />
        <Route element={<Navigate to="/" replace />} />
      </ProtectedRoutes>
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

const ProtectedRoutes = (props: RoutesProps) => {
  const location = useLocation();
  const layoutOverflow = location.pathname === "/editor" ? "hidden" : "auto";
  // Consume Frontegg authentication state.
  const {
    isAuthenticated,
    isLoading,
    routes: authRoutes,
    user,
  } = useFronteggAuth((state) => state);

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
    return <Navigate to={loginUrl} replace />;
  }

  // If we're here, `isLoading` is `false` and `isAuthenticated` is true, which
  // guarantees that `user` is non-null. TypeScript can't infer this, so help it
  // along.
  assert(user);

  // Render the Routes.
  return (
    <AuthProvider user={user}>
      <React.Suspense fallback={<LoadingScreen />}>
        <BaseLayout overflowY={layoutOverflow}>
          <SentryRoutes {...props} />
        </BaseLayout>
      </React.Suspense>
    </AuthProvider>
  );
};

export default Router;
